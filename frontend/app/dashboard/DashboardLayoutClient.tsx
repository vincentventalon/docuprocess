"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import config from "@/config";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";
import { TeamProvider, useTeam } from "@/contexts/TeamContext";
import { Eye, X } from "lucide-react";

function ImpersonationBanner() {
  const { isImpersonating, impersonatedTeam, exitImpersonation } = useTeam();

  if (!isImpersonating || !impersonatedTeam) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-3 text-sm">
      <Eye className="h-4 w-4" />
      <span className="font-medium">
        Admin viewing: {impersonatedTeam.name}
      </span>
      <button
        onClick={exitImpersonation}
        className="flex items-center gap-1 underline hover:no-underline font-medium"
      >
        <X className="h-3.5 w-3.5" />
        Exit
      </button>
    </div>
  );
}

// This is a client-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
export function DashboardLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isDesignerPage = pathname?.includes("/designer");

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(config.auth.loginUrl);
        return;
      }

      setIsLoading(false);
    };

    checkUser();
  }, [router]);


  if (isLoading) {
    return null;
  }

  if (isDesignerPage) {
    return (
      <TeamProvider>
        <div className="w-full h-screen overflow-hidden bg-gray-50 flex flex-col">
          <ImpersonationBanner />
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </TeamProvider>
    );
  }

  return (
    <TeamProvider>
      <div className="flex flex-col min-h-screen w-full bg-gray-50">
        <ImpersonationBanner />
        <div className="flex flex-1">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardMobileNav />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </TeamProvider>
  );
}
