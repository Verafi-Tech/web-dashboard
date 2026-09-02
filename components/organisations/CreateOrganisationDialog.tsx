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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateOrganisation } from "@/hooks/useOrganisation";
import { getErrorMessage } from "@/lib/utils/errors";

const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  country: z.string().max(100).optional(),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

export function CreateOrganisationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [successName, setSuccessName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateOrganisation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormData>({ resolver: zodResolver(createOrgSchema) });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSuccessName(null);
      setFormError(null);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: CreateOrgFormData) {
    setFormError(null);
    try {
      const org = await createMutation.mutateAsync(data);
      setSuccessName(org.name);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>New organisation</DialogTitle>
        {successName ? (
          <>
            <DialogDescription>
              &ldquo;{successName}&rdquo; was created. Sign out and back in to see
              it in your organisation list.
            </DialogDescription>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>
              Creates a new organisation on the platform.
            </DialogDescription>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-3"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-name">Name</Label>
                <Input id="org-name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-description">Description</Label>
                <Textarea id="org-description" rows={3} {...register("description")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-country">Country</Label>
                <Input id="org-country" {...register("country")} />
                <p className="text-[10.5px] text-muted-foreground">
                  Host country. Appears on the VVB monitoring report.
                </p>
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
