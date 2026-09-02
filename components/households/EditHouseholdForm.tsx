"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FileUpload } from "@/components/common/FileUpload";
import { useUpdateHousehold, useDeleteHousehold } from "@/hooks/useHousehold";
import { getErrorMessage } from "@/lib/utils/errors";
import type { Household } from "@/lib/types/household";

const editHouseholdSchema = z.object({
  head_of_household: z.string().max(255).optional(),
  old_stove_type: z.string().max(100).optional(),
  primary_fuel_type: z.string().max(100).optional(),
  new_stove_type: z.string().max(100).optional(),
  stove_serial_number: z.string().max(100).optional(),
  community: z.string().max(255).optional(),
});

type EditHouseholdFormData = z.infer<typeof editHouseholdSchema>;

export function EditHouseholdForm({
  household,
  projectId,
  organisationId,
}: {
  household: Household;
  projectId: string;
  organisationId?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoUploadId, setPhotoUploadId] = useState<string | null>(
    household.photo_old_stove_url
  );

  const updateMutation = useUpdateHousehold(household.id, projectId, organisationId);
  const deleteMutation = useDeleteHousehold(household.id, projectId, organisationId);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EditHouseholdFormData>({
    resolver: zodResolver(editHouseholdSchema),
    defaultValues: {
      head_of_household: household.head_of_household ?? "",
      old_stove_type: household.old_stove_type ?? "",
      primary_fuel_type: household.primary_fuel_type ?? "",
      new_stove_type: household.new_stove_type ?? "",
      stove_serial_number: household.stove_serial_number ?? "",
      community: household.community ?? "",
    },
  });

  async function onSubmit(data: EditHouseholdFormData) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        ...data,
        photo_old_stove_url: photoUploadId ?? undefined,
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function onDelete() {
    try {
      await deleteMutation.mutateAsync();
      router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
      setFormError(getErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-head">Head of household</Label>
            <Input id="edit-hh-head" {...register("head_of_household")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-community">Community</Label>
            <Input id="edit-hh-community" {...register("community")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-old-stove">Old stove type</Label>
            <Input id="edit-hh-old-stove" {...register("old_stove_type")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-fuel">Primary fuel type</Label>
            <Input id="edit-hh-fuel" {...register("primary_fuel_type")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-new-stove">New stove type</Label>
            <Input id="edit-hh-new-stove" {...register("new_stove_type")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-hh-serial">Stove serial number</Label>
            <Input id="edit-hh-serial" {...register("stove_serial_number")} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Photo of old stove</Label>
          <FileUpload
            label="Photo of old stove"
            accept="image/*"
            projectId={projectId}
            organisationId={organisationId}
            existingUploadId={photoUploadId}
            onUploaded={(upload) => setPhotoUploadId(upload.id)}
          />
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <div className="mt-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <h3 className="text-sm font-bold text-foreground">Danger zone</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Deleting a household is permanent.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setDeleteOpen(true)}
        >
          Delete household
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete household"
        description={`This permanently deletes household "${household.household_code}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
