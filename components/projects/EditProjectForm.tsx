"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useUpdateProject, useDeleteProject } from "@/hooks/useProject";
import { getErrorMessage } from "@/lib/utils/errors";
import type { Project } from "@/lib/types/project";

const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().max(100).optional(),
  start_date: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "archived"]),
  verra_project_id: z.string().max(100).optional(),
  description: z.string().optional(),
  location_description: z.string().max(500).optional(),
  scale_category: z.string().max(50).optional(),
  crediting_period_start: z.string().optional(),
  crediting_period_end: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

export function EditProjectForm({
  project,
  organisationId,
}: {
  project: Project;
  organisationId?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMutation = useUpdateProject(project.id, organisationId);
  const deleteMutation = useDeleteProject(project.id, organisationId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      country: project.country,
      state: project.state ?? "",
      start_date: project.start_date,
      status: project.status,
      verra_project_id: project.verra_project_id ?? "",
      description: project.description ?? "",
      location_description: project.location_description ?? "",
      scale_category: project.scale_category ?? "",
      crediting_period_start: project.crediting_period_start ?? "",
      crediting_period_end: project.crediting_period_end ?? "",
    },
  });

  async function onSubmit(data: EditProjectFormData) {
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
      router.push("/dashboard/projects");
    } catch (error) {
      setFormError(getErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-project-name">Name</Label>
          <Input id="edit-project-name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-country">Country</Label>
            <Input id="edit-project-country" {...register("country")} />
            {errors.country && (
              <p className="text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-state">State</Label>
            <Input id="edit-project-state" {...register("state")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-start-date">Start date</Label>
            <Input id="edit-project-start-date" type="date" {...register("start_date")} />
            {errors.start_date && (
              <p className="text-xs text-destructive">{errors.start_date.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-status">Status</Label>
            <Select id="edit-project-status" {...register("status")}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-project-verra-id">Verra project ID</Label>
          <Input id="edit-project-verra-id" {...register("verra_project_id")} />
          <p className="text-[10.5px] text-muted-foreground">
            Once this project is registered with Verra, record its ID here.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-project-description">Description</Label>
          <Textarea id="edit-project-description" rows={2} {...register("description")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-project-location-description">Location description</Label>
          <Input
            id="edit-project-location-description"
            placeholder="e.g. Kaduna State, northern Nigeria"
            {...register("location_description")}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-scale-category">Scale category</Label>
            <Input
              id="edit-project-scale-category"
              placeholder="e.g. Small Scale"
              {...register("scale_category")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-crediting-start" className="text-[10.5px]">
              Crediting period start
            </Label>
            <Input
              id="edit-project-crediting-start"
              type="date"
              {...register("crediting_period_start")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-project-crediting-end" className="text-[10.5px]">
              Crediting period end
            </Label>
            <Input
              id="edit-project-crediting-end"
              type="date"
              {...register("crediting_period_end")}
            />
          </div>
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
          Deleting a project is permanent.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setDeleteOpen(true)}
        >
          Delete project
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project"
        description={`This permanently deletes "${project.name}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
