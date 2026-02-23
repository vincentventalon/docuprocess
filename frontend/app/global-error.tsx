"use client";

import NextError from "next/error";
import { useEffect } from "react";

// Check if error is a hydration/DOM error (caused by browser extensions, translators, etc.)
const isHydrationError = (error: Error): boolean => {
  const message = error?.message || "";
  return (
    message.includes("insertBefore") ||
    message.includes("removeChild") ||
    message.includes("appendChild") ||
    message.includes("Hydration") ||
    message.includes("hydrating")
  );
};

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Auto-retry once for hydration errors (caused by browser translation, extensions, etc.)
    if (isHydrationError(error)) {
      const hasRetried = sessionStorage.getItem("hydration-error-retry");
      if (!hasRetried) {
        sessionStorage.setItem("hydration-error-retry", "true");
        window.location.reload();
        return;
      }
    }
    // Log error to console
    console.error(error);
  }, [error]);

  // Don't show error UI if we're about to auto-retry
  if (isHydrationError(error) && typeof window !== "undefined") {
    try {
      const hasRetried = sessionStorage.getItem("hydration-error-retry");
      if (!hasRetried) {
        return (
          <html lang="en">
            <body></body>
          </html>
        );
      }
    } catch {
      // sessionStorage might not be available
    }
  }

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
