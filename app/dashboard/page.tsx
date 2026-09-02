import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { EmptyState } from "@/components/common/EmptyState";
import { Activity } from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const activeOrg = session?.organisations.find(
    (org) => org.id === session.activeOrganisationId
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title={activeOrg?.name ?? "Dashboard"}
        description="Overview of methodologies, organisations, users, and activity."
      />
      <DashboardStats />
      <EmptyState
        icon={Activity}
        title="No recent activity yet"
        description="Recent methodology, organisation, and user changes will show up here once analytics land in Phase 7."
      />
    </div>
  );
}
