/**
 * API Route: Import Template from Zip
 * POST /api/templates/import
 *
 * Accepts a zip file, extracts html.html and data.json,
 * creates a new template
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { TemplateContent } from "@/libs/types/template";
import { sanitizeTemplateHtml } from "@/libs/sanitize-html";
import JSZip from "jszip";

interface ImportTemplateMetadata {
  name?: string;
  description?: string;
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's current team
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_team_id")
      .eq("id", user.id)
      .single();

    if (!profile?.last_team_id) {
      return NextResponse.json(
        { error: "No team found" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const templateName = formData.get("name") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Verify it's a zip file
    if (!file.name.endsWith(".zip") && file.type !== "application/zip") {
      return NextResponse.json(
        { error: "File must be a zip archive" },
        { status: 400 }
      );
    }

    // Read zip file
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);

    // Extract html file (required) - support both old and new structure
    let htmlFile = zipContent.file("v1/html/main.html");
    if (!htmlFile) {
      // Fallback to old structure
      htmlFile = zipContent.file("html.html");
    }
    if (!htmlFile) {
      return NextResponse.json(
        { error: "Zip must contain v1/html/main.html or html.html file" },
        { status: 400 }
      );
    }
    const html = await htmlFile.async("text");

    // Extract data.json (optional) - support both old and new structure
    let data = undefined;
    let dataFile = zipContent.file("v1/data.json");
    if (!dataFile) {
      dataFile = zipContent.file("data.json");
    }
    if (dataFile) {
      const dataText = await dataFile.async("text");
      try {
        data = JSON.parse(dataText);
      } catch (e) {
        console.warn("Invalid JSON in data.json, ignoring:", e);
      }
    }

    // Extract metadata.json (optional) - support both old and new structure
    let importMetadata: ImportTemplateMetadata = {};
    let metadataFile = zipContent.file("v1/metadata.json");
    if (!metadataFile) {
      metadataFile = zipContent.file("metadata.json");
    }
    if (metadataFile) {
      const metadataText = await metadataFile.async("text");
      try {
        importMetadata = JSON.parse(metadataText);
      } catch (e) {
        console.warn("Invalid JSON in metadata.json, ignoring:", e);
      }
    }

    // Use template name from form data, or from metadata, or from filename
    const finalName =
      templateName ||
      importMetadata.name ||
      file.name.replace(".zip", "");

    // Create template content
    const content: TemplateContent = {
      html,
      data,
    };

    // Create template in database
    // Sanitize HTML to prevent XSS attacks (especially important for imported files)
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .insert({
        team_id: profile.last_team_id,
        name: finalName,
        html_content: sanitizeTemplateHtml(content.html),
        css_content: content.css,
        sample_data: content.data || {},
        paper_format: content.paper_format,
        page_orientation: content.page_orientation,
        page_padding: content.page_padding,
      })
      .select()
      .single();

    if (templateError) {
      console.error("Error creating template:", templateError);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error importing template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
