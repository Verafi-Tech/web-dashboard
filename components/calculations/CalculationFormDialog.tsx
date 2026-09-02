"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaselineDevicesSection } from "@/components/calculations/BaselineDevicesSection";
import { BaselineConsumptionSection } from "@/components/calculations/BaselineConsumptionSection";
import { ProjectDevicesSection } from "@/components/calculations/ProjectDevicesSection";
import { MonitoringDataSection } from "@/components/calculations/MonitoringDataSection";
import { useCreateCalculation } from "@/hooks/useCalculation";
import { useHouseholds } from "@/hooks/useHouseholds";
import { getErrorMessage } from "@/lib/utils/errors";
import { toOptionalNumber } from "@/lib/utils/validation";
import { calculationFormSchema, type CalculationFormData } from "@/lib/utils/validation";
import type { VM0050CalculationRequest } from "@/lib/types/calculation";
import { Sparkles } from "lucide-react";

function defaultValues(): CalculationFormData {
  return {
    year_y: new Date().getFullYear().toString(),
    children_0_14: "",
    females_over_14: "",
    males_15_59: "",
    males_over_59: "",
    baseline_devices: [],
    baseline_consumption: [],
    project_devices: [],
    monitoring_data: [],
    pe_transp_y: "",
    pe_prod_y: "",
    pe_fugitive_y: "",
    pe_backup_y: "",
    f_nrb_y: "",
    eta_bl_y: "",
    eta_pj_y: "",
    le_rb_y: "",
  };
}

function toRequest(projectId: string, data: CalculationFormData): VM0050CalculationRequest {
  return {
    project_id: projectId,
    year_y: Number(data.year_y),
    household_composition: {
      children_0_14: Number(data.children_0_14),
      females_over_14: Number(data.females_over_14),
      males_15_59: Number(data.males_15_59),
      males_over_59: Number(data.males_over_59),
    },
    baseline_devices: data.baseline_devices.map((d) => ({
      device_type_i: d.device_type_i,
      fuel_type: d.fuel_type,
      ef_co2: toOptionalNumber(d.ef_co2),
      ef_nonco2: toOptionalNumber(d.ef_nonco2),
      ncv: toOptionalNumber(d.ncv),
      eta_old: toOptionalNumber(d.eta_old),
      charcoal_renewable_fraction: toOptionalNumber(d.charcoal_renewable_fraction),
      cct_charging_time_hours: toOptionalNumber(d.cct_charging_time_hours),
      cct_cooking_duration_hours: toOptionalNumber(d.cct_cooking_duration_hours),
    })),
    baseline_consumption: data.baseline_consumption.map((c) => ({
      baseline_device_i: c.baseline_device_i,
      method: c.method,
      bc_ex_ante_b_i: toOptionalNumber(c.bc_ex_ante_b_i),
      hh_i: toOptionalNumber(c.hh_i),
      fuel_type: c.fuel_type,
    })),
    project_devices: data.project_devices.map((d) => ({
      device_type_j: d.device_type_j,
      batch_k: d.batch_k,
      fuel_type: d.fuel_type,
      efficiency: Number(d.efficiency),
      electric_power_w: toOptionalNumber(d.electric_power_w),
      electric_grid_emission_factor: toOptionalNumber(d.electric_grid_emission_factor),
      electric_transmission_distribution_loss: toOptionalNumber(
        d.electric_transmission_distribution_loss
      ),
      cct_charging_time_hours: toOptionalNumber(d.cct_charging_time_hours),
      cct_cooking_duration_hours: toOptionalNumber(d.cct_cooking_duration_hours),
      cct_specific_heat_capacity: toOptionalNumber(d.cct_specific_heat_capacity),
    })),
    monitoring_data: data.monitoring_data.map((m) => ({
      device_type_j: m.device_type_j,
      batch_k: m.batch_k,
      year_y: Number(m.year_y),
      n_devices: Number(m.n_devices),
      usage_rate_data: {
        method: m.usage_rate_data.method,
        raw_rate: Number(m.usage_rate_data.raw_rate),
        customer_support_level: m.usage_rate_data.customer_support_level || undefined,
        photographic_evidence_collected: m.usage_rate_data.photographic_evidence_collected,
        lower_ci_used: m.usage_rate_data.lower_ci_used,
      },
      fuel_consumption_kg_per_year: toOptionalNumber(m.fuel_consumption_kg_per_year),
      energy_consumption_mwh_per_year: toOptionalNumber(m.energy_consumption_mwh_per_year),
    })),
    other_emissions: {
      pe_transp_y: toOptionalNumber(data.pe_transp_y),
      pe_prod_y: toOptionalNumber(data.pe_prod_y),
      pe_fugitive_y: toOptionalNumber(data.pe_fugitive_y),
      pe_backup_y: toOptionalNumber(data.pe_backup_y),
    },
    f_nrb_y: toOptionalNumber(data.f_nrb_y),
    eta_bl_y: toOptionalNumber(data.eta_bl_y),
    eta_pj_y: toOptionalNumber(data.eta_pj_y),
    le_rb_y: toOptionalNumber(data.le_rb_y),
  };
}

export function CalculationFormDialog({
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
  const [formError, setFormError] = useState<string | null>(null);
  const households = useHouseholds(projectId, organisationId);
  const createMutation = useCreateCalculation(projectId, organisationId);

  const form = useForm<CalculationFormData>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: defaultValues(),
  });

  function prefillFromHouseholds() {
    const totals = (households.data ?? []).reduce(
      (acc, h) => ({
        children_0_14: acc.children_0_14 + (h.hh_children_0_14 ?? 0),
        females_over_14: acc.females_over_14 + (h.hh_female_over_14 ?? 0),
        males_15_59: acc.males_15_59 + (h.hh_male_15_59 ?? 0),
        males_over_59: acc.males_over_59 + (h.hh_male_over_59 ?? 0),
      }),
      { children_0_14: 0, females_over_14: 0, males_15_59: 0, males_over_59: 0 }
    );
    form.setValue("children_0_14", totals.children_0_14.toString());
    form.setValue("females_over_14", totals.females_over_14.toString());
    form.setValue("males_15_59", totals.males_15_59.toString());
    form.setValue("males_over_59", totals.males_over_59.toString());
  }

  async function onSubmit(data: CalculationFormData) {
    setFormError(null);
    try {
      await createMutation.mutateAsync(toRequest(projectId, data));
      form.reset(defaultValues());
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset(defaultValues());
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogTitle>Run VM0050 calculation</DialogTitle>
        <DialogDescription>
          Calculates emission reductions (ER_y) for a project year from baseline and project
          device data.
        </DialogDescription>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 flex max-h-[75vh] flex-col gap-6 overflow-y-auto pr-1"
            noValidate
          >
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="calc-year">Calculation year</Label>
                <Input id="calc-year" type="number" {...form.register("year_y")} />
                {form.formState.errors.year_y && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.year_y.message}
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Household composition
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={prefillFromHouseholds}
                  disabled={households.isLoading || (households.data?.length ?? 0) === 0}
                >
                  <Sparkles className="size-3.5" />
                  Prefill from households
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor="calc-children" className="text-[10.5px]">
                    Children 0-14
                  </Label>
                  <Input id="calc-children" type="number" min={0} {...form.register("children_0_14")} />
                  {form.formState.errors.children_0_14 && (
                    <p className="text-[10.5px] text-destructive">
                      {form.formState.errors.children_0_14.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="calc-females" className="text-[10.5px]">
                    Females 15+
                  </Label>
                  <Input id="calc-females" type="number" min={0} {...form.register("females_over_14")} />
                  {form.formState.errors.females_over_14 && (
                    <p className="text-[10.5px] text-destructive">
                      {form.formState.errors.females_over_14.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="calc-males-working" className="text-[10.5px]">
                    Males 15-59
                  </Label>
                  <Input id="calc-males-working" type="number" min={0} {...form.register("males_15_59")} />
                  {form.formState.errors.males_15_59 && (
                    <p className="text-[10.5px] text-destructive">
                      {form.formState.errors.males_15_59.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="calc-males-senior" className="text-[10.5px]">
                    Males 60+
                  </Label>
                  <Input id="calc-males-senior" type="number" min={0} {...form.register("males_over_59")} />
                  {form.formState.errors.males_over_59 && (
                    <p className="text-[10.5px] text-destructive">
                      {form.formState.errors.males_over_59.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Baseline devices
              </h3>
              <BaselineDevicesSection />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Baseline consumption
              </h3>
              <BaselineConsumptionSection />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Project devices
              </h3>
              <ProjectDevicesSection />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Monitoring data
              </h3>
              <MonitoringDataSection />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Other project emissions (tCO2e)
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label className="text-[10.5px]">Transport</Label>
                  <Input type="number" step="any" min={0} {...form.register("pe_transp_y")} />
                </div>
                <div>
                  <Label className="text-[10.5px]">Production</Label>
                  <Input type="number" step="any" min={0} {...form.register("pe_prod_y")} />
                </div>
                <div>
                  <Label className="text-[10.5px]">Fugitive</Label>
                  <Input type="number" step="any" min={0} {...form.register("pe_fugitive_y")} />
                </div>
                <div>
                  <Label className="text-[10.5px]">Backup fuel</Label>
                  <Input type="number" step="any" min={0} {...form.register("pe_backup_y")} />
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Advanced parameters (optional — leave blank to use methodology defaults)
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label className="text-[10.5px]">Non-renewable biomass fraction</Label>
                  <Input type="number" step="any" min={0} max={1} {...form.register("f_nrb_y")} />
                  {form.formState.errors.f_nrb_y && (
                    <p className="text-[10.5px] text-destructive">
                      {form.formState.errors.f_nrb_y.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-[10.5px]">Baseline avg. efficiency</Label>
                  <Input type="number" step="any" min={0} max={1} {...form.register("eta_bl_y")} />
                </div>
                <div>
                  <Label className="text-[10.5px]">Project avg. efficiency</Label>
                  <Input type="number" step="any" min={0} max={1} {...form.register("eta_pj_y")} />
                </div>
                <div>
                  <Label className="text-[10.5px]">Leakage emissions (tCO2e)</Label>
                  <Input type="number" step="any" min={0} {...form.register("le_rb_y")} />
                </div>
              </div>
            </section>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Calculating…" : "Run calculation"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
