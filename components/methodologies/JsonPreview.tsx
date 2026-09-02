"use client";

import { useFormContext } from "react-hook-form";
import { fieldsArrayToRecord } from "@/lib/utils/survey-fields";
import type { SurveyTemplateFormData } from "@/lib/utils/validation";

export function JsonPreview() {
  const { watch } = useFormContext<SurveyTemplateFormData>();
  const fields = watch("fields");

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
        JSON preview
      </span>
      <pre className="mt-2 max-h-64 overflow-auto font-mono text-[11px] text-foreground">
        {JSON.stringify(fieldsArrayToRecord(fields ?? []), null, 2)}
      </pre>
    </div>
  );
}
