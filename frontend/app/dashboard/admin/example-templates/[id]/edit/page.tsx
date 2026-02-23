import { ExampleTemplateEditForm } from "@/components/admin/ExampleTemplateEditForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExampleTemplateEditPage({ params }: Props) {
  const { id } = await params;
  return <ExampleTemplateEditForm templateId={id} />;
}
