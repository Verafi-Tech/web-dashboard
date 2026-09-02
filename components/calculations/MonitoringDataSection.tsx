"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { CalculationFormData } from "@/lib/utils/validation";

function defaultMonitoringData(): CalculationFormData["monitoring_data"][number] {
  return {
    device_type_j: "",
    batch_k: "",
    year_y: "",
    n_devices: "",
    usage_rate_data: {
      method: "SURVEY",
      raw_rate: "",
      customer_support_level: undefined,
      photographic_evidence_collected: false,
      lower_ci_used: false,
    },
    fuel_consumption_kg_per_year: "",
    energy_consumption_mwh_per_year: "",
  };
}

export function MonitoringDataSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CalculationFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "monitoring_data" });
  const rootError = errors.monitoring_data?.message;
  const projectDevices = watch("project_devices") ?? [];

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const rowErrors = errors.monitoring_data?.[index];
        const fuelType = projectDevices.find(
          (d) => d.device_type_j === watch(`monitoring_data.${index}.device_type_j`)
        )?.fuel_type;
        const isElectric = fuelType === "ELECTRIC" || fuelType === "ELECTRIC_CCT";
        const id = (suffix: string) => `monitoring-${index}-${suffix}`;
        return (
          <div key={field.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                <div>
                  <Label htmlFor={id("device")} className="text-[10.5px]">
                    Project device
                  </Label>
                  <Select id={id("device")} {...register(`monitoring_data.${index}.device_type_j`)}>
                    <option value="">Select…</option>
                    {projectDevices
                      .filter((d) => d.device_type_j)
                      .map((d) => (
                        <option key={d.device_type_j} value={d.device_type_j}>
                          {d.device_type_j}
                        </option>
                      ))}
                  </Select>
                  {rowErrors?.device_type_j && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.device_type_j.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("batch")} className="text-[10.5px]">
                    Monitoring batch
                  </Label>
                  <Select id={id("batch")} {...register(`monitoring_data.${index}.batch_k`)}>
                    <option value="">Select…</option>
                    {[...new Set(projectDevices.map((d) => d.batch_k).filter(Boolean))].map(
                      (batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      )
                    )}
                  </Select>
                  {rowErrors?.batch_k && (
                    <p className="text-[10.5px] text-destructive">{rowErrors.batch_k.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("year")} className="text-[10.5px]">
                    Monitoring year
                  </Label>
                  <Input id={id("year")} type="number" {...register(`monitoring_data.${index}.year_y`)} />
                  {rowErrors?.year_y && (
                    <p className="text-[10.5px] text-destructive">{rowErrors.year_y.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("n-devices")} className="text-[10.5px]">
                    Number of devices
                  </Label>
                  <Input
                    id={id("n-devices")}
                    type="number"
                    min={1}
                    {...register(`monitoring_data.${index}.n_devices`)}
                  />
                  {rowErrors?.n_devices && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.n_devices.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={id("usage-method")} className="text-[10.5px]">
                    Usage rate method
                  </Label>
                  <Select
                    id={id("usage-method")}
                    {...register(`monitoring_data.${index}.usage_rate_data.method`)}
                  >
                    <option value="SURVEY">Survey</option>
                    <option value="SUMS">SUMS (sensor-monitored)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={id("raw-rate")} className="text-[10.5px]">
                    Usage rate (fraction of meals/uses)
                  </Label>
                  <Input
                    id={id("raw-rate")}
                    type="number"
                    step="any"
                    min={0}
                    {...register(`monitoring_data.${index}.usage_rate_data.raw_rate`)}
                  />
                  {rowErrors?.usage_rate_data?.raw_rate && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.usage_rate_data.raw_rate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={id("support-level")} className="text-[10.5px]">
                    Customer support level
                  </Label>
                  <Select
                    id={id("support-level")}
                    {...register(`monitoring_data.${index}.usage_rate_data.customer_support_level`)}
                  >
                    <option value="">Not specified</option>
                    <option value="FULL_SUPPORT">Full support</option>
                    <option value="NO_FULL_SUPPORT">No full support</option>
                  </Select>
                  {rowErrors?.usage_rate_data?.customer_support_level && (
                    <p className="text-[10.5px] text-destructive">
                      {rowErrors.usage_rate_data.customer_support_level.message}
                    </p>
                  )}
                </div>

                {isElectric ? (
                  <div>
                    <Label htmlFor={id("energy")} className="text-[10.5px]">
                      Energy consumption (MWh/year)
                    </Label>
                    <Input
                      id={id("energy")}
                      type="number"
                      step="any"
                      min={0}
                      {...register(`monitoring_data.${index}.energy_consumption_mwh_per_year`)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={id("fuel")} className="text-[10.5px]">
                      Fuel consumption (kg/year)
                    </Label>
                    <Input
                      id={id("fuel")}
                      type="number"
                      step="any"
                      min={0}
                      {...register(`monitoring_data.${index}.fuel_consumption_kg_per_year`)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                  <Label htmlFor={id("photo-evidence")} className="text-[10.5px]">
                    Photo evidence collected
                  </Label>
                  <Controller
                    control={control}
                    name={`monitoring_data.${index}.usage_rate_data.photographic_evidence_collected`}
                    render={({ field: switchField }) => (
                      <Switch
                        id={id("photo-evidence")}
                        checked={switchField.value}
                        onCheckedChange={switchField.onChange}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                  <Label htmlFor={id("lower-ci")} className="text-[10.5px]">
                    Lower CI used (conservative)
                  </Label>
                  <Controller
                    control={control}
                    name={`monitoring_data.${index}.usage_rate_data.lower_ci_used`}
                    render={({ field: switchField }) => (
                      <Switch
                        id={id("lower-ci")}
                        checked={switchField.value}
                        onCheckedChange={switchField.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove monitoring entry"
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
          No monitoring entries yet. Add usage-rate data for each project device batch.
        </p>
      )}
      {rootError && <p className="text-xs text-destructive">{rootError}</p>}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => append(defaultMonitoringData())}
      >
        <Plus className="size-3.5" />
        Add monitoring entry
      </Button>
    </div>
  );
}
