import { createClient } from "@/libs/supabase/server";
import { getCustomerSubscription, getCustomerInvoices } from "@/libs/stripe";
import config from "@/config";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile to get last_team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id, customer_id")
    .eq("id", user.id)
    .single();

  // Get the current team
  let teamId = profile?.last_team_id;
  if (!teamId) {
    // Fallback: find team user owns
    const { data: ownedTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    teamId = ownedTeam?.id;
  }

  // Fetch team data for billing info
  const { data: team } = teamId
    ? await supabase
        .from("teams")
        .select("id, name, credits, customer_id, price_id, has_paid")
        .eq("id", teamId)
        .single()
    : { data: null };

  // Get credits from team
  const credits = team?.credits || 0;

  // Get team's plan based on their price_id
  const userPlan = team?.price_id
    ? config.stripe.plans.find((p) => p.priceId === team.price_id)
    : null;

  // Check if team is on free tier vs paid plan
  const isFreeTier = userPlan?.isFree === true;
  const hasPaidSubscription = !!userPlan && !isFreeTier;

  // Get free tier plan for fallback
  const freeTierPlan = config.stripe.plans.find((p) => p.isFree);

  // Use the plan's limits (fallback to freeTier config)
  const creditsLimit = userPlan?.credits || freeTierPlan?.credits || config.stripe.freeTier.credits;

  // Fetch subscription dates and invoices from Stripe (using team's customer_id)
  let endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  let invoices: Awaited<ReturnType<typeof getCustomerInvoices>> = [];

  if (team?.customer_id) {
    const [subscription, fetchedInvoices] = await Promise.all([
      hasPaidSubscription ? getCustomerSubscription(team.customer_id) : null,
      getCustomerInvoices(team.customer_id, 3),
    ]);
    if (subscription) {
      endDate = subscription.currentPeriodEnd;
    }
    invoices = fetchedInvoices;
  }

  // Calculate usage percentage (clamped between 0-100)
  const creditsUsed = Math.max(0, creditsLimit - credits);
  const usagePercentage = Math.min(
    100,
    Math.max(0, Math.round((creditsUsed / creditsLimit) * 100))
  );

  // Format date helper - human readable
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get initials for avatar
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const planName = userPlan?.name || freeTierPlan?.name || "Free";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with actions + profile */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ProfileDropdown
                email={user.email || ""}
                customerId={team?.customer_id}
              />
            </div>
          </div>
        </header>

        {/* Main Content - 2 Column Layout (65/35) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5">
          {/* Left Column - Main Content */}
          <div className="space-y-5">
            {/* Welcome Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Welcome to {config.appName}
              </h2>
              <p className="text-gray-600 mb-4">
                Get started by exploring the API documentation or managing your team settings.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href="/docs">View Documentation</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/api">Manage API Keys</Link>
                </Button>
              </div>
            </div>

            {/* Team Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {team?.name || "My Organisation"}
                </h2>
                <Link
                  href="/dashboard/organisation"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Manage <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(user.email || "U")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400">Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Panel */}
          <div>
            <div className="space-y-5 lg:sticky lg:top-6">
              {/* Subscription Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                {/* Plan badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm text-gray-500">Current plan</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {planName}
                  </span>
                </div>

                {/* Credits highlight */}
                <div className="mb-5">
                  <p className="text-3xl font-bold text-gray-900">{credits}</p>
                  <p className="text-sm text-gray-500">credits remaining</p>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Usage</span>
                    <span className="text-gray-900">
                      {creditsUsed} / {creditsLimit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-2 mb-5 text-sm border-t border-gray-100 pt-5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {isFreeTier ? "Resets" : "Renews"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(endDate)}
                    </span>
                  </div>
                  {!isFreeTier && userPlan?.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium text-gray-900">
                        ${userPlan.price}/mo
                      </span>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <Button className="w-full" size="sm" asChild>
                    <Link href="/#pricing">
                      {isFreeTier ? "Upgrade plan" : "Change plan"}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-600" size="sm" asChild>
                    <Link href="/dashboard/analytics">View analytics</Link>
                  </Button>
                </div>
              </div>

              {/* Invoices Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Invoices</h2>
                  <Link
                    href={
                      profile?.customer_id
                        ? "/api/stripe/create-portal"
                        : "/dashboard/settings"
                    }
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {invoices.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                      <a
                        key={invoice.id}
                        href={invoice.invoiceUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-5 px-5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            ${invoice.amount.toFixed(2)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600">
                            Paid
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(invoice.date)}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Receipt className="h-5 w-5 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">No invoices yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
