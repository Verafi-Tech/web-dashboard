"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FUEL_TYPE_OPTIONS } from "@/lib/types/calculation";
import type { CalculationFormData } from "@/lib/utils/validation";

function defaultProjectDevice(): CalculationFormData["project_devices"][number] {
  return {
    device_type_j: "",
    batch_k: "",
    fuel_type: "FIREWOOD",
    efficiency: "",
    electric_power_w: "",
    electric_grid_emission_factor: "",
    electric_transmission_distribution_loss: "",
    cct_charging_time_hours: "",
    cct_cooking_duration_hours: "",
    cct_specific_heat_capacity: "",
  };
}

export function ProjectDevicesSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CalculationFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "project_devices" });
  const rootError = errors.project_devices?.message;

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const fuelType = watch(`project_devices.${index}.fuel_type`);
        const rowErrors = errors.project_devices?.[index];
        const isElectric = fuelType === "ELECTRIC" || fuelType === "ELECTRIC_CCT";
        const id = (suffix: string) => `project-device-${index}-${suffix}`;
        return (
          <div key={field.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                <div>
                  <Label htmlFor={id("device-type")} className="text-[10.5px]">
                    Device type
                  </Label>
                  <Input
                    id={id("device-type")}
                    placeholder="e.g. rocket-stove"
                    {...register(`project_devices.${index}.device_type_j`)}
                  />
                  {rowErrors?.device_type_j && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.device_type_j.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("batch")} className="text-[10.5px]">
                    Batch
                  </Label>
                  <Input
                    id={id("batch")}
                    placeholder="e.g. batch-2026-q1"
                    {...register(`project_devices.${index}.batch_k`)}
                  />
                  {rowErrors?.batch_k && (
                    <p className="text-[10.5px] text-destructive">{rowErrors.batch_k.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("fuel-type")} className="text-[10.5px]">
                    Fuel type
                  </Label>
                  <Select id={id("fuel-type")} {...register(`project_devices.${index}.fuel_type`)}>
                    {FUEL_TYPE_OPTIONS.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor={id("efficiency")} className="text-[10.5px]">
                    Project thermal efficiency (0-1)
                  </Label>
                  <Input
                    id={id("efficiency")}
                    type="number"
                    step="any"
                    min={0}
                    max={1}
                    {...register(`project_devices.${index}.efficiency`)}
                  />
                  {rowErrors?.efficiency && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.efficiency.message}
                    </p>
                  )}
                </div>
                {isElectric && (
                  <>
                    <div>
                      <Label htmlFor={id("power")} className="text-[10.5px]">
                        Power rating (W)
                      </Label>
                      <Input
                        id={id("power")}
                        type="number"
                        step="any"
                        min={0}
                        {...register(`project_devices.${index}.electric_power_w`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={id("grid-ef")} className="text-[10.5px]">
                        Grid emission factor (tCO2e/MWh)
                      </Label>
                      <Input
                        id={id("grid-ef")}
                        type="number"
                        step="any"
                        {...register(`project_devices.${index}.electric_grid_emission_factor`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={id("td-loss")} className="text-[10.5px]">
                        T&D loss factor (0-1)
                      </Label>
                      <Input
                        id={id("td-loss")}
                        type="number"
                        step="any"
                        min={0}
                        max={1}
                        {...register(
                          `project_devices.${index}.electric_transmission_distribution_loss`
                        )}
                      />
                    </div>
                  </>
                )}
                {fuelType === "ELECTRIC_CCT" && (
                  <>
                    <div>
                      <Label htmlFor={id("cct-charge")} className="text-[10.5px]">
                        CCT charging time (hours)
                      </Label>
                      <Input
                        id={id("cct-charge")}
                        type="number"
                        step="any"
                        min={0}
                        {...register(`project_devices.${index}.cct_charging_time_hours`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={id("cct-cook")} className="text-[10.5px]">
                        CCT cooking duration (hours)
                      </Label>
                      <Input
                        id={id("cct-cook")}
                        type="number"
                        step="any"
                        min={0}
                        {...register(`project_devices.${index}.cct_cooking_duration_hours`)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={id("cct-heat")} className="text-[10.5px]">
                        CCT specific heat capacity (MJ/kg·K)
                      </Label>
                      <Input
                        id={id("cct-heat")}
                        type="number"
                        step="any"
                        min={0}
                        {...register(`project_devices.${index}.cct_specific_heat_capacity`)}
                      />
                    </div>
                  </>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove project device"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No project devices yet. Add the new stove type(s) being distributed.
        </p>
      )}
      {rootError && <p className="text-xs text-destructive">{rootError}</p>}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => append(defaultProjectDevice())}
      >
        <Plus className="size-3.5" />
        Add project device
      </Button>
    </div>
  );
}
