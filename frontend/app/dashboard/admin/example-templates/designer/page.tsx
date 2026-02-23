import { TemplateDesigner } from "@/components/templates/TemplateDesigner";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function AdminExampleTemplateDesignerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const templateId = params?.id;

  return <TemplateDesigner templateId={templateId} isAdminMode={true} />;
}
