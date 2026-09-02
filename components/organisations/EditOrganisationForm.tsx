"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useUpdateOrganisation, useDeleteOrganisation } from "@/hooks/useOrganisation";
import { getErrorMessage } from "@/lib/utils/errors";
import type { Organisation } from "@/lib/types/organisation";

const editOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  country: z.string().max(100).optional(),
});

type EditOrgFormData = z.infer<typeof editOrgSchema>;

export function EditOrganisationForm({ organisation }: { organisation: Organisation }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMutation = useUpdateOrganisation(organisation.id);
  const deleteMutation = useDeleteOrganisation(organisation.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditOrgFormData>({
    resolver: zodResolver(editOrgSchema),
    defaultValues: {
      name: organisation.name,
      description: organisation.description ?? "",
      country: organisation.country ?? "",
    },
  });

  async function onSubmit(data: EditOrgFormData) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function onDelete() {
    try {
      await deleteMutation.mutateAsync();
      router.push("/dashboard/organisations");
    } catch (error) {
      setFormError(getErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-org-name">Name</Label>
          <Input id="edit-org-name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-org-description">Description</Label>
          <Textarea id="edit-org-description" rows={3} {...register("description")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-org-country">Country</Label>
          <Input id="edit-org-country" {...register("country")} />
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
          Deleting an organisation is permanent and blocked if it has active
          projects.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setDeleteOpen(true)}
        >
          Delete organisation
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete organisation"
        description={`This permanently deletes "${organisation.name}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
