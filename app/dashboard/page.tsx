import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const activeOrg = session?.organisations.find(
    (org) => org.id === session.activeOrganisationId
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title={activeOrg?.name ?? "Dashboard"}
        description="Overview of projects, organisations, users, and activity."
      />
      <DashboardStats />
      <RecentActivity />
    </div>
  );
}
