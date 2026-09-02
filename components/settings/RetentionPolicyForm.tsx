"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSetRetentionPolicy } from "@/hooks/useRetentionPolicy";
import { getErrorMessage } from "@/lib/utils/errors";
import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_TYPE_OPTIONS } from "@/lib/types/audit";
import type { AuditAction, AuditEntityType, RetentionPolicy } from "@/lib/types/audit";

const retentionPolicySchema = z
  .object({
    policy_type: z.enum(["GLOBAL", "BY_ACTION", "BY_ENTITY_TYPE"]),
    action_type: z.string().optional(),
    entity_type: z.string().optional(),
    retention_days: z
      .string()
      .min(1, "Retention days is required")
      .refine(
        (v) => !Number.isNaN(Number(v)) && Number(v) >= 7 && Number(v) <= 2555,
        "Must be between 7 and 2555 days"
      ),
    auto_delete: z.boolean(),
    anonymize_on_delete: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.policy_type === "BY_ACTION" && !data.action_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required for an action-scoped policy",
        path: ["action_type"],
      });
    }
    if (data.policy_type === "BY_ENTITY_TYPE" && !data.entity_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required for an entity-scoped policy",
        path: ["entity_type"],
      });
    }
  });

type RetentionPolicyFormData = z.infer<typeof retentionPolicySchema>;

function summarize(policy: RetentionPolicy): string {
  const scope =
    policy.policy_type === "BY_ACTION"
      ? `action ${policy.action_type}`
      : policy.policy_type === "BY_ENTITY_TYPE"
        ? `entity ${policy.entity_type}`
        : "all records";
  const deletion = policy.anonymize_on_delete
    ? "anonymized"
    : policy.auto_delete
      ? "auto-deleted"
      : "flagged, not auto-deleted";
  return `Policy set: ${scope}, retained ${policy.retention_days} days, then ${deletion}.`;
}

export function RetentionPolicyForm({ organisationId }: { organisationId?: string }) {
  const [result, setResult] = useState<RetentionPolicy | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const setPolicyMutation = useSetRetentionPolicy(organisationId);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RetentionPolicyFormData>({
    resolver: zodResolver(retentionPolicySchema),
    defaultValues: {
      policy_type: "GLOBAL",
      retention_days: "365",
      auto_delete: true,
      anonymize_on_delete: false,
    },
  });

  const policyType = watch("policy_type");

  async function onSubmit(data: RetentionPolicyFormData) {
    setFormError(null);
    setResult(null);
    try {
      const policy = await setPolicyMutation.mutateAsync({
        policy_type: data.policy_type,
        action_type:
          data.policy_type === "BY_ACTION" ? (data.action_type as AuditAction) : undefined,
        entity_type:
          data.policy_type === "BY_ENTITY_TYPE" ? (data.entity_type as AuditEntityType) : undefined,
        retention_days: Number(data.retention_days),
        auto_delete: data.auto_delete,
        anonymize_on_delete: data.anonymize_on_delete,
      });
      setResult(policy);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <p className="text-xs text-muted-foreground">
        There&rsquo;s no way to review previously-set policies from here — the backend doesn&rsquo;t
        expose a listing endpoint yet. Submitting below replaces the policy for the selected
        scope going forward.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="retention-policy-type">Policy scope</Label>
          <Select id="retention-policy-type" {...register("policy_type")}>
            <option value="GLOBAL">All records</option>
            <option value="BY_ACTION">By action</option>
            <option value="BY_ENTITY_TYPE">By entity type</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="retention-days">Retention days</Label>
          <Input id="retention-days" type="number" min={7} max={2555} {...register("retention_days")} />
          {errors.retention_days && (
            <p className="text-xs text-destructive">{errors.retention_days.message}</p>
          )}
        </div>
      </div>

      {policyType === "BY_ACTION" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="retention-action-type">Action</Label>
          <Select id="retention-action-type" {...register("action_type")}>
            <option value="">Select an action</option>
            {AUDIT_ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </Select>
          {errors.action_type && (
            <p className="text-xs text-destructive">{errors.action_type.message}</p>
          )}
        </div>
      )}

      {policyType === "BY_ENTITY_TYPE" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="retention-entity-type">Entity type</Label>
          <Select id="retention-entity-type" {...register("entity_type")}>
            <option value="">Select an entity type</option>
            {AUDIT_ENTITY_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          {errors.entity_type && (
            <p className="text-xs text-destructive">{errors.entity_type.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
          <Label htmlFor="retention-auto-delete" className="text-xs">
            Auto-delete after retention period
          </Label>
          <Controller
            control={control}
            name="auto_delete"
            render={({ field }) => (
              <Switch
                id="retention-auto-delete"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
          <Label htmlFor="retention-anonymize" className="text-xs">
            Anonymize instead of delete
          </Label>
          <Controller
            control={control}
            name="anonymize_on_delete"
            render={({ field }) => (
              <Switch
                id="retention-anonymize"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {result && (
        <p className="rounded-lg border border-success/30 bg-success-bg p-3 text-sm text-success">
          {summarize(result)}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={setPolicyMutation.isPending}>
          {setPolicyMutation.isPending ? "Saving…" : "Set policy"}
        </Button>
      </div>
    </form>
  );
}
