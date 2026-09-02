"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { CalculationsTable } from "@/components/calculations/CalculationsTable";
import { CalculationFormDialog } from "@/components/calculations/CalculationFormDialog";
import { useCalculations } from "@/hooks/useCalculation";
import { getErrorMessage } from "@/lib/utils/errors";
import { Calculator, Plus } from "lucide-react";

export function CalculationsTab({
  projectId,
  organisationId,
  canManage,
}: {
  projectId: string;
  organisationId?: string;
  canManage: boolean;
}) {
  const { data, isLoading, isError, error } = useCalculations(projectId, organisationId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Run calculation
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={Calculator}
          title="Failed to load calculations"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Calculator}
          title="No calculations yet"
          description={
            canManage
              ? "Run a VM0050 calculation to estimate this project's emission reductions."
              : "Emission-reduction calculations for this project will show up here."
          }
        />
      ) : (
        <CalculationsTable data={data} projectId={projectId} organisationId={organisationId} />
      )}

      {canManage && (
        <CalculationFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          projectId={projectId}
          organisationId={organisationId}
        />
      )}
    </div>
  );
}
