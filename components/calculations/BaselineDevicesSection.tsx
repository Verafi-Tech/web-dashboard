"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FUEL_TYPE_OPTIONS } from "@/lib/types/calculation";
import type { CalculationFormData } from "@/lib/utils/validation";

function defaultBaselineDevice(): CalculationFormData["baseline_devices"][number] {
  return {
    device_type_i: "",
    fuel_type: "FIREWOOD",
    ef_co2: "",
    ef_nonco2: "",
    ncv: "",
    eta_old: "",
    charcoal_renewable_fraction: "",
    cct_charging_time_hours: "",
    cct_cooking_duration_hours: "",
  };
}

export function BaselineDevicesSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CalculationFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "baseline_devices" });
  const rootError = errors.baseline_devices?.message;

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const fuelType = watch(`baseline_devices.${index}.fuel_type`);
        const rowErrors = errors.baseline_devices?.[index];
        const id = (suffix: string) => `baseline-device-${index}-${suffix}`;
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
                    placeholder="e.g. three-stone-fire"
                    {...register(`baseline_devices.${index}.device_type_i`)}
                  />
                  {rowErrors?.device_type_i && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.device_type_i.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("fuel-type")} className="text-[10.5px]">
                    Fuel type
                  </Label>
                  <Select id={id("fuel-type")} {...register(`baseline_devices.${index}.fuel_type`)}>
                    {FUEL_TYPE_OPTIONS.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor={id("eta-old")} className="text-[10.5px]">
                    Baseline thermal efficiency (0-1)
                  </Label>
                  <Input
                    id={id("eta-old")}
                    type="number"
                    step="any"
                    min={0}
                    max={1}
                    {...register(`baseline_devices.${index}.eta_old`)}
                  />
                  {rowErrors?.eta_old && (
                    <p className="text-[10.5px] text-destructive">{rowErrors.eta_old.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("ef-co2")} className="text-[10.5px]">
                    CO2 emission factor (tCO2e/TJ)
                  </Label>
                  <Input
                    id={id("ef-co2")}
                    type="number"
                    step="any"
                    min={0}
                    {...register(`baseline_devices.${index}.ef_co2`)}
                  />
                </div>
                <div>
                  <Label htmlFor={id("ef-nonco2")} className="text-[10.5px]">
                    Non-CO2 emission factor (tCO2e/TJ)
                  </Label>
                  <Input
                    id={id("ef-nonco2")}
                    type="number"
                    step="any"
                    min={0}
                    {...register(`baseline_devices.${index}.ef_nonco2`)}
                  />
                </div>
                <div>
                  <Label htmlFor={id("ncv")} className="text-[10.5px]">
                    Net calorific value (TJ/unit)
                  </Label>
                  <Input
                    id={id("ncv")}
                    type="number"
                    step="any"
                    min={0}
                    {...register(`baseline_devices.${index}.ncv`)}
                  />
                </div>
                {fuelType === "CHARCOAL" && (
                  <div>
                    <Label htmlFor={id("charcoal-fraction")} className="text-[10.5px]">
                      Charcoal renewable fraction (0-1)
                    </Label>
                    <Input
                      id={id("charcoal-fraction")}
                      type="number"
                      step="any"
                      min={0}
                      max={1}
                      {...register(`baseline_devices.${index}.charcoal_renewable_fraction`)}
                    />
                  </div>
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
                        {...register(`baseline_devices.${index}.cct_charging_time_hours`)}
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
                        {...register(`baseline_devices.${index}.cct_cooking_duration_hours`)}
                      />
                    </div>
                  </>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove baseline device"
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
          No baseline devices yet. Add the old stove type(s) being replaced.
        </p>
      )}
      {rootError && <p className="text-xs text-destructive">{rootError}</p>}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => append(defaultBaselineDevice())}
      >
        <Plus className="size-3.5" />
        Add baseline device
      </Button>
    </div>
  );
}
