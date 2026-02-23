"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import config from "@/config";

// Admin-only layout wrapper
// This layout protects all pages under /dashboard/admin/*
// Only users with is_admin = true can access these pages
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = createClient();

      // First check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in - redirect to login
        router.push(config.auth.loginUrl);
        return;
      }

      // Check if user has admin privileges
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || !profile?.is_admin) {
        // Not an admin - redirect to regular dashboard
        console.log("Access denied: User is not an admin");
        router.push("/dashboard");
        return;
      }

      // User is admin - allow access
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  // Show nothing while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Verifying admin access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
