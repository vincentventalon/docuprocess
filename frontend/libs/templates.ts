import { createClient } from "@supabase/supabase-js";

// Lazy initialization to avoid issues with env vars at module load time
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type PublicTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  thumbnail_sm_url: string | null;
  preview_url: string | null;
  tags: string[] | null;
  sample_data: Record<string, unknown> | null;
  paper_format: string;
  page_orientation: string;
  seo_features: { label: string; description: string }[] | null;
  seo_about: { heading: string; paragraphs: string[] } | null;
  created_at: string;
  updated_at: string;
};

export type PublicTemplateDetail = PublicTemplate & {
  html_content: string | null;
  css_content: string | null;
};

export async function getPublicTemplates(): Promise<PublicTemplate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("example_templates")
    .select(
      "id, name, slug, description, category, thumbnail_url, thumbnail_sm_url, preview_url, tags, sample_data, paper_format, page_orientation, seo_features, seo_about, created_at, updated_at"
    )
    .eq("is_active", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching templates:", error);
    return [];
  }

  return data || [];
}

export async function getTemplateBySlug(
  slug: string,
  category?: string
): Promise<PublicTemplateDetail | null> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("example_templates")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching template:", error);
    return null;
  }

  return data;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAvailableFilters(templates: PublicTemplate[]) {
  const categories = [
    ...new Set(templates.map((t) => t.category).filter(Boolean)),
  ] as string[];

  const formats = [
    ...new Set(
      templates.map((t) => `${t.paper_format} ${t.page_orientation}`)
    ),
  ];

  return { categories, formats };
}

export function formatCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    invoice: "Invoices",
    purchase_order: "Purchase Orders",
    receipt: "Receipts",
    certificate: "Certificates",
    letter: "Letters",
    packing_slip: "Packing Slips",
    label: "Labels",
    shipping_label: "Shipping Labels",
  };
  return labels[category.toLowerCase()] || category;
}

// SEO-optimized category descriptions for the templates page
export const categoryDescriptions: Record<string, { heading: string; description: string }> = {
  invoice: {
    heading: "Invoice Templates",
    description: "Professional invoice templates with automatic calculations, tax support, and payment details. Choose from US-style ACH invoices, European VAT invoices, or modern designs with QR codes. Perfect for freelancers, agencies, and e-commerce businesses.",
  },
  purchase_order: {
    heading: "Purchase Order Templates",
    description: "Streamline your procurement process with professional purchase order templates. Features include line items with part numbers, quantity tracking, pricing calculations, supplier details, and approval workflows. Ideal for manufacturing, wholesale, and enterprise purchasing departments.",
  },
  packing_slip: {
    heading: "Packing Slip Templates",
    description: "Streamline your order fulfillment with packing slip templates designed for warehouses and e-commerce. Includes support for barcodes, QR codes, item lists, and shipping details across industries like fashion, electronics, food delivery, and pharmaceuticals.",
  },
  certificate: {
    heading: "Certificate Templates",
    description: "Create professional certificates for achievements, completions, and awards. Elegant designs in portrait and landscape formats, ready for corporate training, online courses, and recognition programs.",
  },
  label: {
    heading: "Label Templates",
    description: "Generate sheets of labels with QR codes, barcodes, or custom data in grid layouts. Ideal for inventory management, asset tagging, product labeling, and batch printing on standard label paper.",
  },
  receipt: {
    heading: "Receipt Templates",
    description: "Generate digital receipts for transactions, payments, and purchases. Clean, professional layouts that work for retail, services, and online businesses.",
  },
  letter: {
    heading: "Letter Templates",
    description: "Professional letter templates for business correspondence, welcome letters, and official communications. Customizable headers, footers, and content areas.",
  },
  shipping_label: {
    heading: "Shipping Label Templates",
    description: "Generate shipping labels for e-commerce, logistics, and fulfillment operations. Carrier-compliant designs with barcode integration, order details, and support for A4 and US Letter formats.",
  },
};

// Order categories for display (most important first)
export const categoryOrder = ["invoice", "purchase_order", "packing_slip", "certificate", "label", "receipt", "letter", "shipping_label"];

export function formatFormatLabel(format: string): string {
  // "A4 portrait" -> "A4 Portrait"
  return format
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// URL helpers for category-based template URLs

/**
 * Convert DB category (underscore) to URL slug (hyphen)
 * e.g., "purchase_order" -> "purchase-order"
 */
export function categoryToUrlSlug(category: string): string {
  return category.replace(/_/g, "-");
}

/**
 * Convert URL slug (hyphen) to DB category (underscore)
 * e.g., "purchase-order" -> "purchase_order"
 */
export function urlSlugToCategory(urlCategory: string): string {
  return urlCategory.replace(/-/g, "_");
}

/**
 * Generate the URL for a template detail page
 */
export function getTemplateUrl(template: {
  category: string | null;
  slug: string | null;
}): string {
  if (!template.category || !template.slug) return "/templates";
  return `/templates/${categoryToUrlSlug(template.category)}/${template.slug}`;
}

/**
 * Generate the URL for a template editor page
 */
export function getTemplateEditorUrl(template: {
  category: string | null;
  slug: string | null;
}): string {
  return `${getTemplateUrl(template)}/editor`;
}
