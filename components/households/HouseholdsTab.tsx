"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { HouseholdsTable } from "@/components/households/HouseholdsTable";
import { CreateHouseholdDialog } from "@/components/households/CreateHouseholdDialog";
import { useHouseholds } from "@/hooks/useHouseholds";
import { getErrorMessage } from "@/lib/utils/errors";
import { Home, Plus } from "lucide-react";

export function HouseholdsTab({
  projectId,
  organisationId,
  canManage,
}: {
  projectId: string;
  organisationId?: string;
  canManage: boolean;
}) {
  const { data, isLoading, isError, error } = useHouseholds(projectId, organisationId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Enrol household
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={Home}
          title="Failed to load households"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No households enrolled yet"
          description={
            canManage
              ? "Enrol a household to get started."
              : "Households enrolled in this project will show up here."
          }
        />
      ) : (
        <HouseholdsTable data={data} projectId={projectId} organisationId={organisationId} />
      )}

      {canManage && (
        <CreateHouseholdDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          projectId={projectId}
          organisationId={organisationId}
        />
      )}
    </div>
  );
}
