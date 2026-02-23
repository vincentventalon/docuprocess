/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import config from "@/config";
import { Button } from "@/components/ui/button";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({
  text = "Get started",
  size = "xl",
}: {
  text?: string;
  size?: "default" | "sm" | "lg" | "xl" | "icon";
}) => {
  const supabase = createClient();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  if (user) {
    return (
      <Button asChild size={size}>
        <Link href={config.auth.callbackUrl} className="gap-2">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.name || "Account"}
              className="w-6 h-6 rounded-full shrink-0"
              referrerPolicy="no-referrer"
              width={24}
              height={24}
            />
          ) : (
            <span className="w-6 h-6 bg-accent flex justify-center items-center rounded-full shrink-0 text-sm">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
            </span>
          )}
          {user?.user_metadata?.name || user?.email || "Account"}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size={size}>
      <Link href={config.auth.loginUrl}>
        {text}
      </Link>
    </Button>
  );
};

export default ButtonSignin;
