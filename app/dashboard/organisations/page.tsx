import { PageHeader } from "@/components/layout/PageHeader";
import { OrganisationsListClient } from "@/components/organisations/OrganisationsListClient";

export default function OrganisationsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Organisations"
        description="Organisations you belong to as a super admin."
      />
      <OrganisationsListClient />
    </div>
  );
}
