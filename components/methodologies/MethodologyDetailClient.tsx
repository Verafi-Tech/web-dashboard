"use client";

import { useMethodologies } from "@/hooks/useMethodologies";
import { useSurveyTemplate } from "@/hooks/useSurveyTemplate";
import { TemplateEditor } from "@/components/methodologies/TemplateEditor";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils/errors";
import { FlaskConical } from "lucide-react";

export function MethodologyDetailClient({ methodologyId }: { methodologyId: string }) {
  const { data: methodologies, isLoading: methodologiesLoading } = useMethodologies();
  const {
    data: template,
    isLoading: templateLoading,
    isError,
    error,
  } = useSurveyTemplate(methodologyId);

  const methodology = methodologies?.find((m) => m.id === methodologyId);

  if (methodologiesLoading || templateLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="Failed to load survey template"
        description={getErrorMessage(error)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">
          {methodology?.name ?? template?.methodology_name ?? "Methodology"}
        </h2>
        {(methodology?.code ?? template?.methodology_code) && (
          <span className="font-mono text-xs text-muted-foreground">
            {methodology?.code ?? template?.methodology_code}
            {methodology?.version ? `-v${methodology.version}` : ""}
          </span>
        )}
        {methodology?.standard && <Badge variant="info">{methodology.standard}</Badge>}
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <TemplateEditor methodologyId={methodologyId} template={template ?? null} />
      </div>
    </div>
  );
}
