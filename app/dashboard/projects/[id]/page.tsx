import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ org?: string }>;
}) {
  const { id } = await params;
  const { org } = await searchParams;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader title="Project" />
      <ProjectDetailClient projectId={id} organisationId={org} />
    </div>
  );
}
