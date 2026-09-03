"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/common/FileUpload";
import { useCreateSurvey, useUpdateSurvey } from "@/hooks/useSurvey";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  toOptionalNumber,
  optionalNonNegativeString,
  optionalNonNegativeIntegerString,
} from "@/lib/utils/validation";
import type { Survey } from "@/lib/types/survey";

const surveyFormSchema = z.object({
  survey_date: z
    .string()
    .min(1, "Survey date is required")
    // Confirmed against the live backend: it rejects a future survey_date
    // with a 422. String comparison is safe here since both sides are
    // YYYY-MM-DD (from a <input type="date">, and toISOString().slice(0,10)).
    .refine((v) => v <= new Date().toISOString().slice(0, 10), "Cannot be in the future"),
  stove_in_use: z.boolean(),
  stove_used_regularly: z.boolean(),
  stove_in_good_condition: z.boolean(),
  old_stove_still_used: z.boolean(),
  primary_fuel_used: z.string().max(100).optional(),
  meals_on_project_stove: optionalNonNegativeIntegerString,
  meals_on_baseline_stove: optionalNonNegativeIntegerString,
  firewood_kg_per_week: optionalNonNegativeString,
  notes: z.string().max(5000).optional(),
});

type SurveyFormData = z.infer<typeof surveyFormSchema>;

export function SurveyFormDialog({
  open,
  onOpenChange,
  householdId,
  projectId,
  organisationId,
  survey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  // Ties the survey's photos to the project as evidence uploads — see
  // FileUpload's own note on why this matters.
  projectId?: string;
  organisationId?: string;
  // Present = edit mode, absent = create mode. Render this dialog with
  // key={survey?.id ?? "create"} from the parent so switching targets
  // remounts it with fresh defaultValues instead of stale ones.
  survey?: Survey;
}) {
  const isEdit = !!survey;
  const [formError, setFormError] = useState<string | null>(null);
  const [photoStoveId, setPhotoStoveId] = useState<string | null>(
    survey?.photo_stove_url ?? null
  );
  const [photoCookingAreaId, setPhotoCookingAreaId] = useState<string | null>(
    survey?.photo_cooking_area_url ?? null
  );

  const createMutation = useCreateSurvey(householdId, organisationId);
  const updateMutation = useUpdateSurvey(survey?.id ?? "", householdId, organisationId);
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      survey_date: survey?.survey_date ?? "",
      stove_in_use: survey?.stove_in_use ?? false,
      stove_used_regularly: survey?.stove_used_regularly ?? false,
      stove_in_good_condition: survey?.stove_in_good_condition ?? false,
      old_stove_still_used: survey?.old_stove_still_used ?? false,
      primary_fuel_used: survey?.primary_fuel_used ?? "",
      meals_on_project_stove: survey?.meals_on_project_stove?.toString() ?? "",
      meals_on_baseline_stove: survey?.meals_on_baseline_stove?.toString() ?? "",
      firewood_kg_per_week: survey?.firewood_kg_per_week ?? "",
      notes: survey?.notes ?? "",
    },
  });

  async function onSubmit(data: SurveyFormData) {
    setFormError(null);
    try {
      await mutation.mutateAsync({
        survey_date: data.survey_date,
        stove_in_use: data.stove_in_use,
        stove_used_regularly: data.stove_used_regularly,
        stove_in_good_condition: data.stove_in_good_condition,
        old_stove_still_used: data.old_stove_still_used,
        primary_fuel_used: data.primary_fuel_used || undefined,
        meals_on_project_stove: toOptionalNumber(data.meals_on_project_stove),
        meals_on_baseline_stove: toOptionalNumber(data.meals_on_baseline_stove),
        firewood_kg_per_week: toOptionalNumber(data.firewood_kg_per_week),
        notes: data.notes || undefined,
        photo_stove_url: photoStoveId ?? undefined,
        photo_cooking_area_url: photoCookingAreaId ?? undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{isEdit ? "Edit survey" : "Record survey"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this monitoring visit."
            : "Record a new monitoring visit for this household."}
        </DialogDescription>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey-date">Survey date</Label>
            <Input id="survey-date" type="date" {...register("survey_date")} />
            {errors.survey_date && (
              <p className="text-xs text-destructive">{errors.survey_date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <Label htmlFor="survey-in-use" className="text-xs">
                Stove in use
              </Label>
              <Controller
                control={control}
                name="stove_in_use"
                render={({ field }) => (
                  <Switch
                    id="survey-in-use"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <Label htmlFor="survey-regularly" className="text-xs">
                Used regularly
              </Label>
              <Controller
                control={control}
                name="stove_used_regularly"
                render={({ field }) => (
                  <Switch
                    id="survey-regularly"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <Label htmlFor="survey-condition" className="text-xs">
                Good condition
              </Label>
              <Controller
                control={control}
                name="stove_in_good_condition"
                render={({ field }) => (
                  <Switch
                    id="survey-condition"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <Label htmlFor="survey-old-stove" className="text-xs">
                Old stove still used
              </Label>
              <Controller
                control={control}
                name="old_stove_still_used"
                render={({ field }) => (
                  <Switch
                    id="survey-old-stove"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey-fuel">Primary fuel used</Label>
            <Input id="survey-fuel" {...register("primary_fuel_used")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="survey-meals-project" className="text-[10.5px]">
                Meals on project stove
              </Label>
              <Input id="survey-meals-project" type="number" min={0} step={1} {...register("meals_on_project_stove")} />
              {errors.meals_on_project_stove && (
                <p className="text-xs text-destructive">
                  {errors.meals_on_project_stove.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="survey-meals-baseline" className="text-[10.5px]">
                Meals on baseline stove
              </Label>
              <Input id="survey-meals-baseline" type="number" min={0} step={1} {...register("meals_on_baseline_stove")} />
              {errors.meals_on_baseline_stove && (
                <p className="text-xs text-destructive">
                  {errors.meals_on_baseline_stove.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="survey-firewood" className="text-[10.5px]">
                Firewood (kg/week)
              </Label>
              <Input id="survey-firewood" type="number" min={0} step="any" {...register("firewood_kg_per_week")} />
              {errors.firewood_kg_per_week && (
                <p className="text-xs text-destructive">
                  {errors.firewood_kg_per_week.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Photo of stove</Label>
              <FileUpload
                label="Photo of stove"
                accept="image/*"
                projectId={projectId}
                organisationId={organisationId}
                existingUploadId={photoStoveId}
                onUploaded={(upload) => setPhotoStoveId(upload.id)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Photo of cooking area</Label>
              <FileUpload
                label="Photo of cooking area"
                accept="image/*"
                projectId={projectId}
                organisationId={organisationId}
                existingUploadId={photoCookingAreaId}
                onUploaded={(upload) => setPhotoCookingAreaId(upload.id)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey-notes">Notes</Label>
            <Textarea id="survey-notes" rows={3} {...register("notes")} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Record survey"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
