import { PageHeader } from "@/components/layout/PageHeader";
import { ReportDetailClient } from "@/components/reports/ReportDetailClient";

export default async function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; reportId: string }>;
  searchParams: Promise<{ org?: string }>;
}) {
  const { id: projectId, reportId } = await params;
  const { org } = await searchParams;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader title="Report" />
      <ReportDetailClient reportId={reportId} projectId={projectId} organisationId={org} />
    </div>
  );
}
