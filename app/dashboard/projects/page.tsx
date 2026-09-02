import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Projects"
        description="Projects in your active organisation."
      />
      <ProjectsListClient />
    </div>
  );
}
