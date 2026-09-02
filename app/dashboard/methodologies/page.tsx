import { PageHeader } from "@/components/layout/PageHeader";
import { MethodologiesListClient } from "@/components/methodologies/MethodologiesListClient";

export default function MethodologiesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Methodologies"
        description="Manage monitoring methodologies and survey templates."
      />
      <MethodologiesListClient />
    </div>
  );
}
