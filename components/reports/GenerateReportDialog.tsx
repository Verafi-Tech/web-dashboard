"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useGenerateReport } from "@/hooks/useReport";
import { getErrorMessage } from "@/lib/utils/errors";

const generateReportSchema = z
  .object({
    period_start: z.string().min(1, "Period start is required"),
    period_end: z.string().min(1, "Period end is required"),
    usage_rate_method: z.enum(["SUMS", "SURVEYS"]),
    // A native <select>'s "not specified" option resolves to "", not
    // undefined — .optional() alone rejects that, so accept "" explicitly
    // too (same gotcha as Calculations' usageRateFormSchema).
    customer_support_level: z.union([z.enum(["FULL", "PARTIAL"]), z.literal("")]).optional(),
  })
  // Documented directly in the backend's schema: customer_support_level is
  // required when usage_rate_method is SURVEYS.
  .superRefine((data, ctx) => {
    if (data.usage_rate_method === "SURVEYS" && !data.customer_support_level) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required for survey-based monitoring",
        path: ["customer_support_level"],
      });
    }
  });

type GenerateReportFormData = z.infer<typeof generateReportSchema>;

export function GenerateReportDialog({
  open,
  onOpenChange,
  projectId,
  organisationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  organisationId?: string;
}) {
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const generateMutation = useGenerateReport(projectId, organisationId);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GenerateReportFormData>({
    resolver: zodResolver(generateReportSchema),
    defaultValues: { usage_rate_method: "SUMS" },
  });

  const usageRateMethod = watch("usage_rate_method");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSuccess(false);
      setFormError(null);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: GenerateReportFormData) {
    setFormError(null);
    try {
      await generateMutation.mutateAsync({
        period_start: data.period_start,
        period_end: data.period_end,
        usage_rate_method: data.usage_rate_method,
        customer_support_level: data.customer_support_level || undefined,
      });
      setSuccess(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Generate report</DialogTitle>
        {success ? (
          <>
            <DialogDescription>
              The report was generated. It&rsquo;s listed below once you close this dialog.
            </DialogDescription>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>
              Generates a monitoring report for a reporting period, computed directly from
              this project&rsquo;s household and survey data.
            </DialogDescription>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-3"
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="report-period-start">Period start</Label>
                  <Input id="report-period-start" type="date" {...register("period_start")} />
                  {errors.period_start && (
                    <p className="text-xs text-destructive">{errors.period_start.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="report-period-end">Period end</Label>
                  <Input id="report-period-end" type="date" {...register("period_end")} />
                  {errors.period_end && (
                    <p className="text-xs text-destructive">{errors.period_end.message}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-usage-rate-method">Usage rate method</Label>
                <Select id="report-usage-rate-method" {...register("usage_rate_method")}>
                  <option value="SUMS">SUMS (stove usage monitoring sensors)</option>
                  <option value="SURVEYS">Surveys</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-customer-support">Customer support level</Label>
                <Select id="report-customer-support" {...register("customer_support_level")}>
                  <option value="">Not specified</option>
                  <option value="FULL">Full</option>
                  <option value="PARTIAL">Partial</option>
                </Select>
                {usageRateMethod === "SURVEYS" && errors.customer_support_level && (
                  <p className="text-xs text-destructive">
                    {errors.customer_support_level.message}
                  </p>
                )}
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? "Generating…" : "Generate report"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
