"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FUEL_TYPE_OPTIONS } from "@/lib/types/calculation";
import type { CalculationFormData } from "@/lib/utils/validation";

function defaultBaselineConsumption(): CalculationFormData["baseline_consumption"][number] {
  return {
    baseline_device_i: "",
    method: "DEFAULT_VALUES",
    bc_ex_ante_b_i: "",
    hh_i: "",
    fuel_type: "FIREWOOD",
  };
}

export function BaselineConsumptionSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CalculationFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "baseline_consumption" });
  const rootError = errors.baseline_consumption?.message;
  const deviceTypes = (watch("baseline_devices") ?? [])
    .map((d) => d.device_type_i)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const rowErrors = errors.baseline_consumption?.[index];
        const id = (suffix: string) => `baseline-consumption-${index}-${suffix}`;
        return (
          <div key={field.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                <div>
                  <Label htmlFor={id("device")} className="text-[10.5px]">
                    Baseline device
                  </Label>
                  <Select
                    id={id("device")}
                    {...register(`baseline_consumption.${index}.baseline_device_i`)}
                  >
                    <option value="">Select…</option>
                    {deviceTypes.map((deviceType) => (
                      <option key={deviceType} value={deviceType}>
                        {deviceType}
                      </option>
                    ))}
                  </Select>
                  {rowErrors?.baseline_device_i && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.baseline_device_i.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("fuel-type")} className="text-[10.5px]">
                    Fuel type
                  </Label>
                  <Select
                    id={id("fuel-type")}
                    {...register(`baseline_consumption.${index}.fuel_type`)}
                  >
                    {FUEL_TYPE_OPTIONS.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor={id("method")} className="text-[10.5px]">
                    Method
                  </Label>
                  <Select id={id("method")} {...register(`baseline_consumption.${index}.method`)}>
                    <option value="DEFAULT_VALUES">Default values</option>
                    <option value="MEASUREMENT_CAMPAIGN">Measurement campaign</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={id("bc-ex-ante")} className="text-[10.5px]">
                    Ex-ante consumption (TJ/person/year)
                  </Label>
                  <Input
                    id={id("bc-ex-ante")}
                    type="number"
                    step="any"
                    min={0}
                    {...register(`baseline_consumption.${index}.bc_ex_ante_b_i`)}
                  />
                </div>
                <div>
                  <Label htmlFor={id("hh-size")} className="text-[10.5px]">
                    Household size (equivalent adults)
                  </Label>
                  <Input
                    id={id("hh-size")}
                    type="number"
                    step="any"
                    min={0.1}
                    {...register(`baseline_consumption.${index}.hh_i`)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove baseline consumption entry"
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
          No consumption entries yet.
        </p>
      )}
      {rootError && <p className="text-xs text-destructive">{rootError}</p>}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => append(defaultBaselineConsumption())}
      >
        <Plus className="size-3.5" />
        Add consumption entry
      </Button>
    </div>
  );
}
