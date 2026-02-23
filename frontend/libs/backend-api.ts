/**
 * Utility for making authenticated requests to the FastAPI backend.
 * Automatically includes the X-Team-ID header when impersonating.
 */

/**
 * Get the impersonated team ID from sessionStorage (if any).
 * Returns null if not impersonating.
 */
export function getImpersonatedTeamId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const storedTeam = sessionStorage.getItem("impersonating_team");
    if (storedTeam) {
      const team = JSON.parse(storedTeam);
      return team?.id || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Build headers for backend API requests.
 * Includes Authorization and X-Team-ID (when impersonating).
 */
export function getBackendHeaders(accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  const impersonatedTeamId = getImpersonatedTeamId();
  if (impersonatedTeamId) {
    headers["X-Team-ID"] = impersonatedTeamId;
  }

  return headers;
}

/**
 * Get the backend API base URL.
 */
export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.example.com";
}
