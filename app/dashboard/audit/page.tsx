import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canViewAuditLogs } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { AuditLogsClient } from "@/components/audit/AuditLogsClient";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!canViewAuditLogs(session?.activeOrganisationRole)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Audit Logs"
        description="Filter and review admin activity across the platform."
      />
      <AuditLogsClient />
    </div>
  );
}
