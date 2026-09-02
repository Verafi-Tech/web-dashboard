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
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/common/FileUpload";
import { useCreateHousehold } from "@/hooks/useHousehold";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  toOptionalNumber,
  optionalNonNegativeString,
  optionalNumericString,
} from "@/lib/utils/validation";

const createHouseholdSchema = z.object({
  head_of_household: z.string().max(255).optional(),
  household_size: z
    .string()
    .min(1, "Household size is required")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 1,
      "Household size must be at least 1"
    ),
  hh_children_0_14: optionalNonNegativeString,
  hh_female_over_14: optionalNonNegativeString,
  hh_male_15_59: optionalNonNegativeString,
  hh_male_over_59: optionalNonNegativeString,
  old_stove_type: z.string().max(100).optional(),
  primary_fuel_type: z.string().max(100).optional(),
  new_stove_type: z.string().max(100).optional(),
  stove_serial_number: z.string().max(100).optional(),
  enrolment_date: z.string().min(1, "Enrolment date is required"),
  gps_latitude: optionalNumericString,
  gps_longitude: optionalNumericString,
  community: z.string().max(255).optional(),
});

type CreateHouseholdFormData = z.infer<typeof createHouseholdSchema>;

export function CreateHouseholdDialog({
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
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoUploadId, setPhotoUploadId] = useState<string | null>(null);
  const createMutation = useCreateHousehold(projectId, organisationId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHouseholdFormData>({ resolver: zodResolver(createHouseholdSchema) });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSuccessCode(null);
      setFormError(null);
      setPhotoUploadId(null);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: CreateHouseholdFormData) {
    setFormError(null);
    try {
      const household = await createMutation.mutateAsync({
        head_of_household: data.head_of_household || undefined,
        household_size: Number(data.household_size),
        hh_children_0_14: toOptionalNumber(data.hh_children_0_14),
        hh_female_over_14: toOptionalNumber(data.hh_female_over_14),
        hh_male_15_59: toOptionalNumber(data.hh_male_15_59),
        hh_male_over_59: toOptionalNumber(data.hh_male_over_59),
        old_stove_type: data.old_stove_type || undefined,
        primary_fuel_type: data.primary_fuel_type || undefined,
        new_stove_type: data.new_stove_type || undefined,
        stove_serial_number: data.stove_serial_number || undefined,
        enrolment_date: data.enrolment_date,
        gps_latitude: toOptionalNumber(data.gps_latitude),
        gps_longitude: toOptionalNumber(data.gps_longitude),
        photo_old_stove_url: photoUploadId ?? undefined,
        community: data.community || undefined,
      });
      setSuccessCode(household.household_code);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Enrol household</DialogTitle>
        {successCode ? (
          <>
            <DialogDescription>
              Household &ldquo;{successCode}&rdquo; was enrolled.
            </DialogDescription>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>
              Enrol a new household in this project.
            </DialogDescription>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
              noValidate
            >
              <p className="text-[10.5px] text-muted-foreground">
                Household code is generated automatically once enrolled.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-head">Head of household</Label>
                  <Input id="hh-head" {...register("head_of_household")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-community">Community</Label>
                  <Input id="hh-community" {...register("community")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-size">Household size</Label>
                  <Input
                    id="hh-size"
                    type="number"
                    min={1}
                    {...register("household_size")}
                  />
                  {errors.household_size && (
                    <p className="text-xs text-destructive">
                      {errors.household_size.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-enrolment-date">Enrolment date</Label>
                  <Input id="hh-enrolment-date" type="date" {...register("enrolment_date")} />
                  {errors.enrolment_date && (
                    <p className="text-xs text-destructive">
                      {errors.enrolment_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Composition (optional — used for adult-equivalent calculation)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="hh-children" className="text-[10.5px]">
                      Children 0-14
                    </Label>
                    <Input
                      id="hh-children"
                      type="number"
                      min={0}
                      {...register("hh_children_0_14")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="hh-females" className="text-[10.5px]">
                      Females 15+
                    </Label>
                    <Input
                      id="hh-females"
                      type="number"
                      min={0}
                      {...register("hh_female_over_14")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="hh-males-adult" className="text-[10.5px]">
                      Males 15-59
                    </Label>
                    <Input
                      id="hh-males-adult"
                      type="number"
                      min={0}
                      {...register("hh_male_15_59")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="hh-males-senior" className="text-[10.5px]">
                      Males 60+
                    </Label>
                    <Input
                      id="hh-males-senior"
                      type="number"
                      min={0}
                      {...register("hh_male_over_59")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-old-stove">Old stove type</Label>
                  <Input id="hh-old-stove" {...register("old_stove_type")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-fuel">Primary fuel type</Label>
                  <Input id="hh-fuel" {...register("primary_fuel_type")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-new-stove">New stove type</Label>
                  <Input id="hh-new-stove" {...register("new_stove_type")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-serial">Stove serial number</Label>
                  <Input id="hh-serial" {...register("stove_serial_number")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-lat">GPS latitude</Label>
                  <Input
                    id="hh-lat"
                    type="number"
                    step="any"
                    {...register("gps_latitude")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hh-lng">GPS longitude</Label>
                  <Input
                    id="hh-lng"
                    type="number"
                    step="any"
                    {...register("gps_longitude")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Photo of old stove</Label>
                <FileUpload
                  label="Photo of old stove"
                  accept="image/*"
                  projectId={projectId}
                  organisationId={organisationId}
                  onUploaded={(upload) => setPhotoUploadId(upload.id)}
                />
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
                  {createMutation.isPending ? "Enrolling…" : "Enrol household"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
