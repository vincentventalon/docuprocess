import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import config from "@/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL(config.auth.callbackUrl, req.url));
  }

  try {
    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if user was logged in during checkout
    const userId = stripeSession.client_reference_id;

    if (userId) {
      // User was already logged in, redirect to dashboard
      return NextResponse.redirect(new URL(config.auth.callbackUrl, req.url));
    }

    // User was NOT logged in - generate and redirect to magic link
    const customer = stripeSession.customer;
    if (!customer) {
      return NextResponse.redirect(new URL(config.auth.loginUrl, req.url));
    }

    // Get customer email
    const stripeCustomer = await stripe.customers.retrieve(customer as string);
    const customerEmail = (stripeCustomer as any).email;

    if (!customerEmail) {
      return NextResponse.redirect(new URL(config.auth.loginUrl, req.url));
    }

    // Create admin Supabase client
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some((u: any) => u.email === customerEmail);

    // Generate appropriate link based on whether user exists
    const linkType = userExists ? 'magiclink' : 'invite';

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: linkType as 'magiclink' | 'invite',
      email: customerEmail,
      options: {
        redirectTo: `${req.nextUrl.origin}${config.auth.callbackUrl}`,
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error generating link:", linkError);
      return NextResponse.redirect(new URL(config.auth.loginUrl, req.url));
    }

    // Redirect directly to the magic link
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (error) {
    console.error("Error in stripe success:", error);
    return NextResponse.redirect(new URL(config.auth.loginUrl, req.url));
  }
}
