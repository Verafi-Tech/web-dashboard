"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SurveysTable } from "@/components/surveys/SurveysTable";
import { SurveyFormDialog } from "@/components/surveys/SurveyFormDialog";
import { useSurveys } from "@/hooks/useSurveys";
import { useDeleteSurvey } from "@/hooks/useSurvey";
import { getErrorMessage } from "@/lib/utils/errors";
import { ClipboardList, Plus } from "lucide-react";
import type { Survey } from "@/lib/types/survey";

export function SurveysTab({
  householdId,
  projectId,
  organisationId,
  canManage,
}: {
  householdId: string;
  projectId?: string;
  organisationId?: string;
  canManage: boolean;
}) {
  const { data, isLoading, isError, error } = useSurveys(householdId, organisationId);
  const [formTarget, setFormTarget] = useState<Survey | "create" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);
  const deleteMutation = useDeleteSurvey(deleteTarget?.id ?? "", householdId, organisationId);

  async function onDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync();
      setDeleteTarget(null);
    } catch {
      // Dialog stays open on failure so the user sees it didn't go through.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setFormTarget("create")}>
            <Plus className="size-4" />
            Record survey
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={ClipboardList}
          title="Failed to load surveys"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No surveys recorded yet"
          description={
            canManage
              ? "Record a survey to get started."
              : "Monitoring visits for this household will show up here."
          }
        />
      ) : (
        <SurveysTable
          data={data}
          canManage={canManage}
          onEdit={setFormTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {canManage && formTarget && (
        <SurveyFormDialog
          key={formTarget === "create" ? "create" : formTarget.id}
          open={!!formTarget}
          onOpenChange={(open) => !open && setFormTarget(null)}
          householdId={householdId}
          projectId={projectId}
          organisationId={organisationId}
          survey={formTarget === "create" ? undefined : formTarget}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete survey"
        description={
          deleteTarget
            ? `This permanently deletes the survey from ${new Date(deleteTarget.survey_date).toLocaleDateString()}. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
