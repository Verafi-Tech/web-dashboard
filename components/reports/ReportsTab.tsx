"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { useReports } from "@/hooks/useReport";
import { useCalculations } from "@/hooks/useCalculation";
import { getErrorMessage } from "@/lib/utils/errors";
import { FileText, Plus } from "lucide-react";

export function ReportsTab({
  projectId,
  organisationId,
  canManage,
}: {
  projectId: string;
  organisationId?: string;
  canManage: boolean;
}) {
  const { data, isLoading, isError, error } = useReports(projectId, organisationId);
  const calculations = useCalculations(projectId, organisationId);
  const [generateOpen, setGenerateOpen] = useState(false);

  // Confirmed against the live backend 2026-09-02: report generation
  // requires an existing calculation for the project ("Run a calculation
  // before generating a monitoring report") — not independent of Phase 6 as
  // originally assumed. Warn up front rather than letting the user hit that
  // error inside the dialog with no context.
  const needsCalculation = !calculations.isLoading && (calculations.data?.length ?? 0) === 0;

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex flex-col items-end gap-1.5">
          <Button
            onClick={() => setGenerateOpen(true)}
            disabled={needsCalculation}
            title={needsCalculation ? "Run a calculation for this project first" : undefined}
          >
            <Plus className="size-4" />
            Generate report
          </Button>
          {needsCalculation && (
            <p className="text-xs text-muted-foreground">
              Run a calculation for this project first — reports are generated from it.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={FileText}
          title="Failed to load reports"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description={
            canManage
              ? "Generate a monitoring report for a reporting period to get started."
              : "Monitoring reports for this project will show up here."
          }
        />
      ) : (
        <ReportsTable data={data} projectId={projectId} organisationId={organisationId} />
      )}

      {canManage && (
        <GenerateReportDialog
          open={generateOpen}
          onOpenChange={setGenerateOpen}
          projectId={projectId}
          organisationId={organisationId}
        />
      )}
    </div>
  );
}
