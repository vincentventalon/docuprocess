import type { PagePadding, PageFormat, PageOrientation } from "@/types/page-settings";

/**
 * Template Types
 *
 * Simple template system without versioning.
 * Each save overwrites the previous content.
 */

export interface Template {
  id: string;
  user_id: string;
  short_id?: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Sample data structure for testing templates
 */
export interface TemplateSampleData {
  [key: string]: any;
}

/**
 * The complete template content
 */
export interface TemplateContent {
  html: string;
  css?: string;
  paper_format?: PageFormat;
  page_orientation?: PageOrientation;
  page_padding?: PagePadding;
  infinite_mode?: boolean;
  data?: TemplateSampleData;
}

/**
 * Full template with content
 */
export interface TemplateWithContent extends Template {
  content: TemplateContent;
}
