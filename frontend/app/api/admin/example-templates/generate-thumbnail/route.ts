/**
 * API Route: Generate and Store Thumbnails (Admin Only)
 * POST /api/admin/example-templates/generate-thumbnail
 *
 * 1. Calls backend to generate small (400px) + large (1200px) PNG thumbnails + PDF preview
 * 2. Uploads all to Supabase Storage
 * 3. Updates thumbnail_url, thumbnail_sm_url, preview_url in database
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

interface GenerateThumbnailRequest {
  template_id: string;
  html: string;
  variables?: Record<string, unknown>;
  page_settings?: {
    format: string;
    orientation: string;
    padding: { top: number; right: number; bottom: number; left: number };
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request
    const body: GenerateThumbnailRequest = await req.json();
    const { template_id, html, variables, page_settings } = body;

    if (!template_id || !html) {
      return NextResponse.json(
        { error: "Missing template_id or html" },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from("example_templates")
      .select("id, name")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Example template not found" },
        { status: 404 }
      );
    }

    // Get session for backend auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const backendHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };

    const thumbnailBody = {
      html,
      variables: variables || {},
      mode: "infinite",
      page_settings,
    };

    // Step 1: Generate small thumbnail, large thumbnail, and PDF in parallel
    const [smResponse, lgResponse, pdfResponse] = await Promise.all([
      fetch(`${backendUrl}/ui/thumbnail/generate`, {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify({ ...thumbnailBody, width: 400 }),
      }),
      fetch(`${backendUrl}/ui/thumbnail/generate`, {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify({ ...thumbnailBody, width: 1200 }),
      }),
      fetch(`${backendUrl}/ui/pdf/create`, {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify({
          html,
          variables: variables || {},
          mode: "infinite",
          page_settings,
        }),
      }),
    ]);

    if (!smResponse.ok) {
      const errorText = await smResponse.text();
      console.error("Backend small thumbnail generation failed:", errorText);
      return NextResponse.json(
        { error: `Small thumbnail generation failed: ${errorText}` },
        { status: 500 }
      );
    }

    if (!lgResponse.ok) {
      const errorText = await lgResponse.text();
      console.error("Backend large thumbnail generation failed:", errorText);
      return NextResponse.json(
        { error: `Large thumbnail generation failed: ${errorText}` },
        { status: 500 }
      );
    }

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("Backend PDF generation failed:", errorText);
      return NextResponse.json(
        { error: `PDF generation failed: ${errorText}` },
        { status: 500 }
      );
    }

    // Step 2: Upload all to Supabase Storage in parallel
    const [smBuffer, lgBuffer, pdfBuffer] = await Promise.all([
      smResponse.arrayBuffer().then((ab) => Buffer.from(ab)),
      lgResponse.arrayBuffer().then((ab) => Buffer.from(ab)),
      pdfResponse.arrayBuffer().then((ab) => Buffer.from(ab)),
    ]);

    const smPath = `example-templates/${template_id}-sm.png`;
    const lgPath = `example-templates/${template_id}.png`;
    const pdfPath = `example-templates/${template_id}.pdf`;

    const [smUpload, lgUpload, pdfUpload] = await Promise.all([
      supabase.storage.from("thumbnails").upload(smPath, smBuffer, {
        contentType: "image/png",
        upsert: true,
      }),
      supabase.storage.from("thumbnails").upload(lgPath, lgBuffer, {
        contentType: "image/png",
        upsert: true,
      }),
      supabase.storage.from("thumbnails").upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      }),
    ]);

    if (smUpload.error) {
      console.error("Small PNG upload failed:", smUpload.error);
      return NextResponse.json(
        { error: `Small PNG upload failed: ${smUpload.error.message}` },
        { status: 500 }
      );
    }

    if (lgUpload.error) {
      console.error("Large PNG upload failed:", lgUpload.error);
      return NextResponse.json(
        { error: `Large PNG upload failed: ${lgUpload.error.message}` },
        { status: 500 }
      );
    }

    if (pdfUpload.error) {
      console.error("PDF upload failed:", pdfUpload.error);
      return NextResponse.json(
        { error: `PDF upload failed: ${pdfUpload.error.message}` },
        { status: 500 }
      );
    }

    // Step 3: Get public URLs with cache buster
    const cacheBuster = `?v=${Date.now()}`;
    const thumbnailSmUrl =
      supabase.storage.from("thumbnails").getPublicUrl(smPath).data.publicUrl.trim() + cacheBuster;
    const thumbnailUrl =
      supabase.storage.from("thumbnails").getPublicUrl(lgPath).data.publicUrl.trim() + cacheBuster;
    const previewUrl =
      supabase.storage.from("thumbnails").getPublicUrl(pdfPath).data.publicUrl.trim() + cacheBuster;

    // Step 4: Update database with all URLs
    const { error: updateError } = await supabase
      .from("example_templates")
      .update({
        thumbnail_url: thumbnailUrl,
        thumbnail_sm_url: thumbnailSmUrl,
        preview_url: previewUrl,
      })
      .eq("id", template_id);

    if (updateError) {
      console.error("Database update failed:", updateError);
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      thumbnail_url: thumbnailUrl,
      thumbnail_sm_url: thumbnailSmUrl,
      preview_url: previewUrl,
    });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
