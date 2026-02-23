import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, FileText } from "lucide-react";
import BadgePill from "@/components/ui/badge-pill";
import { Button } from "@/components/ui/button";
import {
  getTemplateEditorUrl,
  type PublicTemplate,
} from "@/libs/templates";

// Default featured template IDs - one from each category
const DEFAULT_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Invoice - Sapphire Professional Invoice
  "0e8bacde-06b4-4453-8ed2-2314c6abe676", // Packing Slip - Clean Ecommerce Packing Slip
  "eb676de4-6e12-469b-9820-c166f099eca1", // Certificate - Default Certificate
  "a1b2c3d4-5555-4000-8000-000000000005", // Receipt - Sales Receipt with Line Items
  "02eabbf3-8782-4d23-b660-1a6bab318109", // Shipping Label - Shipping Label A4
  "0b51407c-46e2-4295-b2ec-5c3e35f73f79", // Label (QR) - QR Code Sheet
];

// Ecommerce-specific template IDs
export const ECOMMERCE_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Invoice - Sapphire Professional Invoice
  "0e8bacde-06b4-4453-8ed2-2314c6abe676", // Packing Slip - Clean Ecommerce Packing Slip
  "a1b2c3d4-5555-4000-8000-000000000005", // Receipt - Sales Receipt with Line Items
  "02eabbf3-8782-4d23-b660-1a6bab318109", // Shipping Label - Shipping Label A4
  "0b51407c-46e2-4295-b2ec-5c3e35f73f79", // Label (QR) - QR Code Sheet
  "562c7687-a21a-479c-984d-4adeb7fde53d", // Packing Slip - Warehouse Wholesale Packing Slip
];

// Logistics & 3PL template IDs
export const LOGISTICS_TEMPLATE_IDS = [
  "bf466686-77a3-4838-a43d-73bb837f659e", // Barcode Sheet
  "121e08d5-b9c4-4236-934f-b08a8cfda261", // Shipping Label - US Letter
  "562c7687-a21a-479c-984d-4adeb7fde53d", // Warehouse Wholesale Packing Slip
  "ed89c84a-8c79-48c1-86a1-147ce86d82cb", // Modern Packing Slip with QR & Barcode
  "55a292cf-b71f-4c3c-9cb8-44611d2a81c2", // Tech Electronics Packing Slip
  "0b51407c-46e2-4295-b2ec-5c3e35f73f79", // QR Code Sheet
];

// Healthcare template IDs
export const HEALTHCARE_TEMPLATE_IDS = [
  "9289037c-8591-490a-9a19-9c64886dff1b", // Pharmaceutical Medical Packing Slip
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice (billing)
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt (billing)
];

// Fintech template IDs
export const FINTECH_TEMPLATE_IDS = [
  "a1b2c3d4-3333-4000-8000-000000000003", // Payment Confirmation Receipt
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3", // American Invoice with ACH Details
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
];

// Insurance template IDs
export const INSURANCE_TEMPLATE_IDS = [
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "a1b2c3d4-6666-4000-8000-000000000006", // Deposit Receipt
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
];

// Procurement template IDs
export const PROCUREMENT_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice (as PO)
  "8d728210-d563-4803-a1a6-e32c4d9f5566", // European Corporate Invoice
  "562c7687-a21a-479c-984d-4adeb7fde53d", // Warehouse Wholesale Packing Slip
];

// Human Resources template IDs
export const HUMAN_RESOURCES_TEMPLATE_IDS = [
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt (contractor)
  "eb676de4-6e12-469b-9820-c166f099eca1", // Certificate (training)
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
];

// Legal template IDs
export const LEGAL_TEMPLATE_IDS = [
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "a1b2c3d4-6666-4000-8000-000000000006", // Deposit Receipt (retainer)
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3", // American Invoice with ACH
];

// Sales template IDs
export const SALES_TEMPLATE_IDS = [
  "a1b2c3d4-5555-4000-8000-000000000005", // Sales Receipt with Line Items
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
  "ed89c84a-8c79-48c1-86a1-147ce86d82cb", // Modern Packing Slip with QR & Barcode
];

// Real Estate template IDs
export const REAL_ESTATE_TEMPLATE_IDS = [
  "a1b2c3d4-1111-4000-8000-000000000001", // Rent Receipt
  "a1b2c3d4-6666-4000-8000-000000000006", // Deposit Receipt
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
];

// Education template IDs
export const EDUCATION_TEMPLATE_IDS = [
  "eb676de4-6e12-469b-9820-c166f099eca1", // Certificate (diplomas, training certs)
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt (tuition)
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice (tuition invoices)
];

// Accounting template IDs
export const ACCOUNTING_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "8d728210-d563-4803-a1a6-e32c4d9f5566", // European Corporate Invoice
];

// Manufacturing template IDs
export const MANUFACTURING_TEMPLATE_IDS = [
  "562c7687-a21a-479c-984d-4adeb7fde53d", // Warehouse Wholesale Packing Slip
  "ed89c84a-8c79-48c1-86a1-147ce86d82cb", // Modern Packing Slip with QR & Barcode
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
];

// Marketing template IDs
export const MARKETING_TEMPLATE_IDS = [
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
  "a1b2c3d4-5555-4000-8000-000000000005", // Sales Receipt with Line Items
];

// No-Code template IDs
export const NOCODE_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice
  "a1b2c3d4-5555-4000-8000-000000000005", // Sales Receipt with Line Items
  "eb676de4-6e12-469b-9820-c166f099eca1", // Certificate
];

// Agency template IDs
export const AGENCY_TEMPLATE_IDS = [
  "488c0863-a6c4-4717-a97c-121f7b50cd03", // Neo Brutalist Invoice
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "8d728210-d563-4803-a1a6-e32c4d9f5566", // European Corporate Invoice
];

// Startup template IDs
export const STARTUP_TEMPLATE_IDS = [
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3", // American Invoice with ACH Details
  "a1b2c3d4-5555-4000-8000-000000000005", // Sales Receipt with Line Items
  "a1b2c3d4-3333-4000-8000-000000000003", // Payment Confirmation Receipt
];

export interface TemplateShowcaseProps {
  templateIds?: string[];
  badge?: string;
  title?: string;
  description?: string;
  browseUrl?: string;
  browseLabel?: string;
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getFeaturedTemplates(templateIds: string[]): Promise<PublicTemplate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("example_templates")
    .select(
      "id, name, slug, description, category, thumbnail_url, thumbnail_sm_url, preview_url, tags, sample_data, paper_format, page_orientation, seo_features, seo_about, created_at, updated_at"
    )
    .in("id", templateIds)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching featured templates:", error);
    return [];
  }

  // Sort by the order in templateIds
  const sortedData = (data || []).sort((a, b) => {
    return templateIds.indexOf(a.id) - templateIds.indexOf(b.id);
  });

  return sortedData;
}

function TemplateCard({ template }: { template: PublicTemplate }) {
  const editorUrl = getTemplateEditorUrl(template);
  const isLandscape = template.page_orientation === "landscape";

  return (
    <div className="group flex flex-col">
      {/* Fixed height container for consistent alignment */}
      <div className="mb-6 aspect-[210/297] flex items-center justify-center">
        <div
          className={`relative ${isLandscape ? "w-full aspect-[297/210]" : "w-full h-full"} rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-white`}
        >
          {template.thumbnail_sm_url || template.thumbnail_url ? (
            <img
              src={template.thumbnail_sm_url || template.thumbnail_url!}
              alt={template.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-xl text-foreground mb-2 line-clamp-1 text-center">
        {template.name}
      </h3>

      {/* Links */}
      <div className="flex items-center justify-center gap-3 text-base">
        <Link
          href={editorUrl}
          className="text-primary hover:underline font-medium"
        >
          Launch Editor
        </Link>
        {template.preview_url && (
          <>
            <span className="text-muted-foreground">|</span>
            <Link
              href={template.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              View PDF
              <ExternalLink className="h-3 w-3" />
            </Link>
          </>
        )}
      </div>

    </div>
  );
}

export default async function TemplateShowcase({
  templateIds = DEFAULT_TEMPLATE_IDS,
  badge = "Ready to use",
  title = "Sample templates",
  description = "Professional PDF templates for invoices, certificates, shipping labels, and more.\nFully customizable and ready for API integration.",
  browseUrl = "/templates",
  browseLabel = "Browse all templates",
}: TemplateShowcaseProps = {}) {
  const templates = await getFeaturedTemplates(templateIds);

  if (templates.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <BadgePill>{badge}</BadgePill>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground mb-10 mx-auto whitespace-pre-line">
          {description}
        </p>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signin">Start building yours</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={browseUrl}>{browseLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
