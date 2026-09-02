"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FieldBuilder } from "@/components/methodologies/FieldBuilder";
import { JsonPreview } from "@/components/methodologies/JsonPreview";
import {
  useSaveSurveyTemplate,
  useDeleteSurveyTemplate,
} from "@/hooks/useSurveyTemplate";
import { fieldsArrayToRecord, fieldsRecordToArray } from "@/lib/utils/survey-fields";
import {
  surveyTemplateFormSchema,
  type SurveyTemplateFormData,
} from "@/lib/utils/validation";
import { getErrorMessage } from "@/lib/utils/errors";
import type { SurveyTemplate } from "@/lib/types/methodology";

export function TemplateEditor({
  methodologyId,
  template,
}: {
  methodologyId: string;
  template: SurveyTemplate | null;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<SurveyTemplateFormData>({
    resolver: zodResolver(surveyTemplateFormSchema),
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      fields: template ? fieldsRecordToArray(template.fields) : [],
    },
  });

  const saveMutation = useSaveSurveyTemplate(methodologyId, !!template);
  const deleteMutation = useDeleteSurveyTemplate(methodologyId);

  async function onSubmit(data: SurveyTemplateFormData) {
    setFormError(null);
    try {
      await saveMutation.mutateAsync({
        name: data.name,
        description: data.description,
        fields: fieldsArrayToRecord(data.fields),
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function onDelete() {
    try {
      await deleteMutation.mutateAsync();
      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-name">
              <span className="text-destructive">*</span> Template name
            </Label>
            <Input id="template-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              rows={2}
              {...form.register("description")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Fields
          </h3>
          <FieldBuilder />
        </div>

        <JsonPreview />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex items-center justify-between">
          <div>
            {template && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete template
              </Button>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : template
                ? "Save changes"
                : "Create template"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete survey template"
        description="This permanently removes the survey template for this methodology. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </FormProvider>
  );
}
