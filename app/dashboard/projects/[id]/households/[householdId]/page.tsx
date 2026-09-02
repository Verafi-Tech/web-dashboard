import { PageHeader } from "@/components/layout/PageHeader";
import { HouseholdDetailClient } from "@/components/households/HouseholdDetailClient";

export default async function HouseholdDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; householdId: string }>;
  searchParams: Promise<{ org?: string }>;
}) {
  const { id: projectId, householdId } = await params;
  const { org } = await searchParams;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader title="Household" />
      <HouseholdDetailClient
        householdId={householdId}
        projectId={projectId}
        organisationId={org}
      />
    </div>
  );
}
