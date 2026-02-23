import { createClient } from "@/libs/supabase/server";
import { getCurrentTeamId } from "@/libs/team";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

interface ConvertRequest {
  url?: string;
  pdf_base64?: string;
}

/**
 * POST /api/convert
 * Proxy PDF conversion requests to the FastAPI backend
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getCurrentTeamId(supabase, user.id);
    if (!teamId) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Get user's access token to authenticate with backend
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    const body: ConvertRequest = await req.json();

    // Validate request
    if (!body.url && !body.pdf_base64) {
      return NextResponse.json(
        {
          success: false,
          error: "Must provide either 'url' or 'pdf_base64'",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    if (body.url && body.pdf_base64) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide either 'url' or 'pdf_base64', not both",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // Forward request to backend
    const response = await fetch(
      `${BACKEND_URL}/v1/convert/pdf-to-markdown`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "x-team-id": teamId,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in POST /api/convert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
