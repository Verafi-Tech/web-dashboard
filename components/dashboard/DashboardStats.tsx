"use client";

import { useSession } from "next-auth/react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { useReportsCount } from "@/hooks/useReport";
import { canManageUsers } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { data: session } = useSession();
  const projects = useProjects(session?.activeOrganisationId ?? "");
  const users = useUsers();
  const showUserCount = canManageUsers(session?.activeOrganisationRole);

  const activeProjects = projects.data?.filter((p) => p.status === "active").length;
  const reports = useReportsCount(
    projects.data?.map((p) => p.id) ?? [],
    session?.activeOrganisationId
  );

  return (
    <div className={cn("grid grid-cols-2 gap-4", showUserCount ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      <StatsCard
        label="Active projects"
        value={activeProjects ?? 0}
        isLoading={projects.isLoading}
        isError={projects.isError}
      />
      <StatsCard
        label="Organisations"
        value={session?.organisations.length ?? 0}
        isLoading={!session}
      />
      {showUserCount && (
        <StatsCard
          label="Total users"
          value={users.data?.length ?? 0}
          isLoading={users.isLoading}
          isError={users.isError}
        />
      )}
      <StatsCard
        label="Reports generated"
        value={reports.count}
        isLoading={projects.isLoading || reports.isLoading}
        isError={reports.isError}
      />
    </div>
  );
}
