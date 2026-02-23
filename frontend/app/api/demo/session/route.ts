/**
 * API Route: Generate Demo Session Token
 * POST /api/demo/session
 *
 * Generates a signed session token for public demo preview requests.
 * Token is signed server-side so users cannot forge it.
 */

import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Secret key - only exists on server, users cannot access
const SECRET = new TextEncoder().encode(
  process.env.DEMO_SESSION_SECRET || "demo-session-secret-change-in-prod-32chars!"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template_id } = body;

    if (!template_id) {
      return NextResponse.json(
        { error: "template_id required" },
        { status: 400 }
      );
    }

    // Generate a signed token (3 minute expiry)
    // Only the server can create valid tokens
    const token = await new SignJWT({
      template_id,
      type: "demo_session",
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("3m")
      .sign(SECRET);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating demo session:", error);
    return NextResponse.json(
      { error: "Failed to generate session" },
      { status: 500 }
    );
  }
}
