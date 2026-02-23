/**
 * Shared utilities for free tool generators
 */

export interface TemplateData {
  id: string;
  name: string;
  description?: string;
  thumbnail_url: string;
  sample_data: Record<string, unknown>;
  paper_format: string;
  page_orientation: string;
  [key: string]: unknown;
}

export interface FetchTemplatesResult {
  templates: TemplateData[];
  default_template_id: string;
}

// App URL for Next.js API routes (used during SSR)
function getAppUrl(): string {
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Production domain
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Local development
  return "http://localhost:3000";
}

/**
 * Fetch templates for a given generator type from Next.js API route
 * Used for server-side rendering (SSR) to pre-populate template data
 */
export async function fetchGeneratorTemplates(
  generatorType: string
): Promise<FetchTemplatesResult | null> {
  try {
    const response = await fetch(
      `${getAppUrl()}/api/generators/${generatorType}/template`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
