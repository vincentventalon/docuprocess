"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Settings,
  LayoutDashboard,
  Code,
  Sparkles,
  Book,
  Zap,
  BarChart3,
  HardDrive,
  Menu,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import config from "@/config";
import { cn } from "@/lib/utils";
import { createClient } from "@/libs/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { TeamSwitcher } from "@/components/teams/TeamSwitcher";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Templates",
    url: "/dashboard/templates",
    icon: FileText,
  },
  {
    title: "Browse Examples",
    url: "/dashboard/browse-examples",
    icon: Book,
  },
  {
    title: "API",
    url: "/dashboard/api",
    icon: Code,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Organisation",
    url: "/dashboard/organisation",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

const adminMenuItems = [
  {
    title: "Example Templates",
    url: "/dashboard/admin/example-templates",
    icon: Sparkles,
  },
];

export function DashboardMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ email: string; customerId?: string | null } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, customer_id")
          .eq("id", authUser.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
        setUser({
          email: authUser.email || "",
          customerId: profile?.customer_id,
        });
      }
    };

    fetchUserData();
  }, []);

  // Auto-close sheet when pathname changes (navigation occurred)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Hamburger menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="text-left">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold">{config.appName}</span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* Team Switcher */}
            <div className="border-b px-3 py-3">
              <TeamSwitcher />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Menu
              </p>
              <ul className="space-y-0.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Integrations Section */}
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                Integrations
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/dashboard/s3"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                      pathname === "/dashboard/s3"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {pathname === "/dashboard/s3" && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <HardDrive className="h-4 w-4" />
                    <span>S3 Storage</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/zapier"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                      pathname === "/dashboard/zapier"
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {pathname === "/dashboard/zapier" && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full" />
                    )}
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span>Zapier</span>
                  </Link>
                </li>
              </ul>

              {/* Admin Section */}
              {isAdmin && (
                <>
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
                    Admin
                  </p>
                  <ul className="space-y-0.5">
                    {adminMenuItems.map((item) => {
                      const isActive = pathname === item.url;
                      return (
                        <li key={item.title}>
                          <Link
                            href={item.url}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                              isActive
                                ? "bg-purple-50 text-purple-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-r-full" />
                            )}
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Center: App name */}
        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg font-bold">{config.appName}</span>
        </Link>

        {/* Right: Profile dropdown */}
        <div className="flex items-center">
          {user && (
            <ProfileDropdown
              email={user.email}
              customerId={user.customerId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
