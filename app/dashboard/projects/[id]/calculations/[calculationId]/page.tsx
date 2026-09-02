import { PageHeader } from "@/components/layout/PageHeader";
import { CalculationDetailClient } from "@/components/calculations/CalculationDetailClient";

export default async function CalculationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; calculationId: string }>;
  searchParams: Promise<{ org?: string }>;
}) {
  const { id: projectId, calculationId } = await params;
  const { org } = await searchParams;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader title="Calculation" />
      <CalculationDetailClient
        calculationId={calculationId}
        projectId={projectId}
        organisationId={org}
      />
    </div>
  );
}
