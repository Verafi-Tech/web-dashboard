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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApproveReport } from "@/hooks/useReport";
import { getErrorMessage } from "@/lib/utils/errors";

const approveReportSchema = z
  .object({
    status: z.enum(["VERIFIED", "REJECTED"]),
    vvb_name: z.string().min(1, "VVB name is required").max(255),
    vvb_comments: z.string().optional(),
  })
  // Documented directly in the backend's schema: vvb_comments is required
  // when rejecting.
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && !data.vvb_comments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required when rejecting a report",
        path: ["vvb_comments"],
      });
    }
  });

type ApproveReportFormData = z.infer<typeof approveReportSchema>;

export function ApproveReportDialog({
  open,
  onOpenChange,
  reportId,
  projectId,
  organisationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  projectId: string;
  organisationId?: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const approveMutation = useApproveReport(reportId, projectId, organisationId);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApproveReportFormData>({
    resolver: zodResolver(approveReportSchema),
    defaultValues: { status: "VERIFIED" },
  });

  const status = watch("status");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFormError(null);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: ApproveReportFormData) {
    setFormError(null);
    try {
      await approveMutation.mutateAsync({
        status: data.status,
        vvb_name: data.vvb_name,
        vvb_comments: data.vvb_comments || undefined,
      });
      handleOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Record VVB decision</DialogTitle>
        <DialogDescription>
          Record the verification body&rsquo;s decision on this report.
        </DialogDescription>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-approval-status">Decision</Label>
            <Select id="report-approval-status" {...register("status")}>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-vvb-name">VVB name</Label>
            <Input id="report-vvb-name" {...register("vvb_name")} />
            {errors.vvb_name && (
              <p className="text-xs text-destructive">{errors.vvb_name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-vvb-comments">
              Comments{status === "REJECTED" && <span className="text-destructive"> *</span>}
            </Label>
            <Textarea id="report-vvb-comments" rows={3} {...register("vvb_comments")} />
            {errors.vvb_comments && (
              <p className="text-xs text-destructive">{errors.vvb_comments.message}</p>
            )}
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={approveMutation.isPending}>
              {approveMutation.isPending ? "Saving…" : "Submit decision"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
