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
import { useMethodologies } from "@/hooks/useMethodologies";
import { useCreateProject } from "@/hooks/useProject";
import { getErrorMessage } from "@/lib/utils/errors";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  methodology_code: z.string().min(1, "Select a methodology"),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().max(100).optional(),
  start_date: z.string().min(1, "Start date is required"),
  description: z.string().optional(),
  location_description: z.string().max(500).optional(),
  scale_category: z.string().max(50).optional(),
  crediting_period_start: z.string().optional(),
  crediting_period_end: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [successName, setSuccessName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const methodologies = useMethodologies();
  const createMutation = useCreateProject();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { country: "Nigeria" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSuccessName(null);
      setFormError(null);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: CreateProjectFormData) {
    setFormError(null);
    try {
      const project = await createMutation.mutateAsync(data);
      setSuccessName(project.name);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>New project</DialogTitle>
        {successName ? (
          <>
            <DialogDescription>
              &ldquo;{successName}&rdquo; was created.
            </DialogDescription>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>
              Creates a new project in your organisation.
            </DialogDescription>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-3"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-name">Name</Label>
                <Input id="project-name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-methodology">Methodology</Label>
                <Select
                  id="project-methodology"
                  disabled={methodologies.isLoading}
                  {...register("methodology_code")}
                >
                  <option value="">
                    {methodologies.isLoading ? "Loading…" : "Select a methodology"}
                  </option>
                  {methodologies.data?.map((m) => (
                    <option key={m.id} value={m.code}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </Select>
                {errors.methodology_code && (
                  <p className="text-xs text-destructive">
                    {errors.methodology_code.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project-country">Country</Label>
                  <Input id="project-country" {...register("country")} />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project-state">State</Label>
                  <Input id="project-state" {...register("state")} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-start-date">Start date</Label>
                <Input id="project-start-date" type="date" {...register("start_date")} />
                {errors.start_date && (
                  <p className="text-xs text-destructive">{errors.start_date.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-description">Description</Label>
                <Textarea id="project-description" rows={2} {...register("description")} />
                <p className="text-[10.5px] text-muted-foreground">
                  Project description as it appears on the report.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-location-description">Location description</Label>
                <Input
                  id="project-location-description"
                  placeholder="e.g. Kaduna State, northern Nigeria"
                  {...register("location_description")}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project-scale-category">Scale category</Label>
                  <Input
                    id="project-scale-category"
                    placeholder="e.g. Small Scale"
                    {...register("scale_category")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project-crediting-start" className="text-[10.5px]">
                    Crediting period start
                  </Label>
                  <Input
                    id="project-crediting-start"
                    type="date"
                    {...register("crediting_period_start")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="project-crediting-end" className="text-[10.5px]">
                    Crediting period end
                  </Label>
                  <Input
                    id="project-crediting-end"
                    type="date"
                    {...register("crediting_period_end")}
                  />
                </div>
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
