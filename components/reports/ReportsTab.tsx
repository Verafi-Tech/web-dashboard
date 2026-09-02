"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { useReports } from "@/hooks/useReport";
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
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="size-4" />
            Generate report
          </Button>
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
