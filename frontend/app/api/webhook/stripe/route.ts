import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// Updates the teams table for billing (credits, customer_id, has_paid, price_id)
export async function POST(req: NextRequest) {
  const body = await req.text();

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created
        // ✅ Grant access to the product (update team billing info)
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        // Get team_id from metadata (passed during checkout)
        const teamId = stripeObject.metadata?.team_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) break;

        // Find the team to update
        let targetTeamId = teamId;

        if (!targetTeamId) {
          // Fallback: find user and get their current team
          let userIdToUse: string | undefined;
          let userTeamId: string | null = null;

          if (!userId) {
            // check if user already exists by email
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, last_team_id")
              .eq("email", customer.email)
              .single();
            if (profile) {
              userIdToUse = profile.id;
              userTeamId = profile.last_team_id;
            } else {
              // create a new user using supabase auth admin
              // The handle_new_user trigger will create their team
              const { data } = await supabase.auth.admin.createUser({
                email: customer.email,
              });
              const newUser = data?.user;

              // Wait briefly for trigger to complete, then fetch the team
              if (newUser) {
                userIdToUse = newUser.id;
                const { data: newProfile } = await supabase
                  .from("profiles")
                  .select("last_team_id")
                  .eq("id", newUser.id)
                  .single();
                userTeamId = newProfile?.last_team_id || null;
              }
            }
          } else {
            // find user by ID
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, last_team_id")
              .eq("id", userId)
              .single();
            if (profile) {
              userIdToUse = profile.id;
              userTeamId = profile.last_team_id;
            }
          }

          // Get user's current team if we don't have it yet
          if (!targetTeamId && userTeamId) {
            targetTeamId = userTeamId;
          }

          // If still no team, find the team they own
          if (!targetTeamId && userIdToUse) {
            const { data: ownedTeam } = await supabase
              .from("teams")
              .select("id")
              .eq("owner_id", userIdToUse)
              .single();
            targetTeamId = ownedTeam?.id;
          }
        }

        if (!targetTeamId) {
          console.error("Could not determine team for checkout session");
          break;
        }

        // Reset credits to plan amount (monthly allowance)
        const creditsForPlan = plan.credits || 0;

        // For free tier (price = 0), has_paid remains false
        // For paid plans, has_paid = true
        const isPaidPlan = plan.price > 0;

        // Update the team with billing info
        await supabase
          .from("teams")
          .update({
            customer_id: customerId,
            price_id: priceId,
            has_paid: isPaidPlan,
            credits: creditsForPlan,
          })
          .eq("id", targetTeamId);

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // We'll handle the actual change in customer.subscription.deleted when it's canceled
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        // When subscription is deleted, revert to free tier
        const freeTierPlan = configFile.stripe.plans.find(p => p.isFree);
        const freeTierCredits = freeTierPlan?.credits || 100;

        // Update team by customer_id
        await supabase
          .from("teams")
          .update({
            has_paid: false,
            credits: freeTierCredits,
            price_id: freeTierPlan?.priceId || null
          })
          .eq("customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (recurring payment for subscription)
        // ✅ Grant access / reset monthly credits
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find team by customer_id
        const { data: team } = await supabase
          .from("teams")
          .select("id, price_id")
          .eq("customer_id", customerId)
          .single();

        if (!team) break;

        // Make sure the invoice is for the same plan (priceId) the team subscribed to
        if (team.price_id !== priceId) break;

        // Find the plan to get the number of credits
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);
        if (!plan) break;

        // Reset credits to monthly allowance (not cumulative)
        const creditsForPlan = plan.credits || 0;
        const isPaidPlan = plan.price > 0;

        // Update team with refreshed credits
        await supabase
          .from("teams")
          .update({
            has_paid: isPaidPlan,
            credits: creditsForPlan,
          })
          .eq("id", team.id);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (customer does not have valid payment method)
        // Stripe will automatically email the customer (Smart Retries)
        // We'll receive customer.subscription.deleted when all retries fail
        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
