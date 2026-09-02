"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useProjects } from "@/hooks/useProjects";
import { canManageProjects } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/utils/errors";
import { FolderKanban, Plus } from "lucide-react";

export function ProjectsListClient() {
  const { data: session } = useSession();
  const activeOrganisationId = session?.activeOrganisationId;
  const { data, isLoading, isError, error } = useProjects(activeOrganisationId ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = canManageProjects(session?.activeOrganisationRole);

  return (
    <div className="flex flex-col gap-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New project
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={FolderKanban}
          title="Failed to load projects"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            canCreate
              ? "Create a project to get started."
              : "Projects for this organisation will show up here once created."
          }
        />
      ) : (
        <ProjectsTable data={data} />
      )}

      {canCreate && (
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
