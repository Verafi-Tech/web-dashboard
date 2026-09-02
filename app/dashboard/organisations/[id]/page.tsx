import { PageHeader } from "@/components/layout/PageHeader";
import { OrganisationDetailClient } from "@/components/organisations/OrganisationDetailClient";

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader title="Organisation" />
      <OrganisationDetailClient organisationId={id} />
    </div>
  );
}
