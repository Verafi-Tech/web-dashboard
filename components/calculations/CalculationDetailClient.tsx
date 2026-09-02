"use client";

import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { useCalculation } from "@/hooks/useCalculation";
import { getErrorMessage } from "@/lib/utils/errors";
import { formatDecimal } from "@/lib/utils/format";
import type { CalculationStatus } from "@/lib/types/calculation";

const STATUS_VARIANT: Record<CalculationStatus, "success" | "info" | "danger"> = {
  COMPLETED: "success",
  IN_PROGRESS: "info",
  FAILED: "danger",
};

function projectHref(projectId: string, organisationId?: string) {
  return organisationId
    ? `/dashboard/projects/${projectId}?org=${organisationId}`
    : `/dashboard/projects/${projectId}`;
}

function StatCard({
  label,
  value,
  unit,
  numeric = true,
}: {
  label: string;
  value: string;
  unit?: string;
  // The backend returns full-precision decimal strings (e.g.
  // "1.3831091039999999") that overflow a fixed-width card — round for
  // display only here, and keep the exact value in a title tooltip (same
  // truncate-but-keep-full-value convention as Breadcrumb's UUIDs).
  numeric?: boolean;
}) {
  const display = numeric ? formatDecimal(value) : value;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <p className="mt-1 truncate font-mono text-lg font-bold text-foreground" title={numeric ? value : undefined}>
        {display}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

export function CalculationDetailClient({
  calculationId,
  projectId,
  organisationId,
}: {
  calculationId: string;
  projectId: string;
  organisationId?: string;
}) {
  const { data: calculation, isLoading, isError, error } = useCalculation(
    calculationId,
    organisationId
  );

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !calculation) {
    return (
      <EmptyState
        icon={Calculator}
        title="Failed to load calculation"
        description={error ? getErrorMessage(error) : "Calculation not found."}
      />
    );
  }

  const { result } = calculation;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={projectHref(projectId, organisationId)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to project
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">
          VM0050 calculation — {result.year_y}
        </h2>
        <Badge variant={STATUS_VARIANT[calculation.status]}>{calculation.status}</Badge>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg p-4">
          <h3 className="text-sm font-bold text-danger">Errors</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-danger">
            {result.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn-bg p-4">
          <h3 className="text-sm font-bold text-warn">Warnings</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-warn">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Net emission reductions (ER_y)" value={result.net_emission_reductions} unit="tCO2e" />
        <StatCard label="Baseline emissions (BE_y)" value={result.baseline_emissions} unit="tCO2e" />
        <StatCard label="Project emissions (PE_y)" value={result.project_emissions} unit="tCO2e" />
        <StatCard label="Leakage (LE_RB,y)" value={result.le_rb_y} unit="tCO2e" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
        <p>{result.emission_reductions_result.formula_trace}</p>
        <p className="mt-1">
          Methodology {result.methodology_version} · Clarifications {result.clarifications_version}
          {result.clarifications_applied.length > 0 &&
            ` (${result.clarifications_applied.join(", ")})`}
        </p>
        {result.leakage_note && <p className="mt-1">{result.leakage_note}</p>}
      </div>

      <Tabs defaultValue="baseline">
        <TabsList>
          <TabsTrigger value="baseline">Baseline breakdown</TabsTrigger>
          <TabsTrigger value="project">Project breakdown</TabsTrigger>
          <TabsTrigger value="audit">Parameter audit trail</TabsTrigger>
        </TabsList>

        <TabsContent value="baseline">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="BE_y" value={result.baseline_emissions_breakdown.be_y} unit="tCO2e" />
              <StatCard
                label="Consumption method"
                value={result.baseline_emissions_breakdown.consumption_method}
                numeric={false}
              />
              <StatCard label="BC value" value={result.baseline_emissions_breakdown.bc_value} />
              <StatCard label="NCV value" value={result.baseline_emissions_breakdown.ncv_value} />
            </div>

            {result.baseline_emissions_breakdown.stove_stacking_result && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="text-sm font-bold text-foreground">Stove stacking check</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.baseline_emissions_breakdown.stove_stacking_result.explanation}
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Device</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Devices</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">EC applied</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Combined EF</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">BE contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {result.baseline_emissions_breakdown.per_device_contributions.map((d, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-foreground">{d.device_type_i}</td>
                      <td className="px-4 py-3">{d.n_devices}</td>
                      <td className="px-4 py-3 font-mono text-xs" title={d.ec_i_y_applied}>
                        {formatDecimal(d.ec_i_y_applied)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" title={d.combined_ef}>
                        {formatDecimal(d.combined_ef)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" title={d.be_contribution}>
                        {formatDecimal(d.be_contribution)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="project">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="PE_y" value={result.project_emissions_breakdown.pe_y} unit="tCO2e" />
              <StatCard label="Energy" value={result.project_emissions_breakdown.pe_energy_y} unit="tCO2e" />
              <StatCard label="Other" value={result.project_emissions_breakdown.pe_others_y} unit="tCO2e" />
              <StatCard
                label="Calc paths used"
                value={result.project_emissions_breakdown.calc_paths_used.join(", ") || "—"}
                numeric={false}
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Device / batch</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Calc path</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Devices</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Usage rate applied</th>
                    <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">PE contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {result.project_emissions_breakdown.per_device_contributions.map((d, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {d.device_type_j} / {d.batch_k}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="draft">{d.calc_path}</Badge>
                      </td>
                      <td className="px-4 py-3">{d.n_devices}</td>
                      <td className="px-4 py-3 font-mono text-xs" title={d.usage_rate_applied}>
                        {formatDecimal(d.usage_rate_applied)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" title={d.pe_contribution}>
                        {formatDecimal(d.pe_contribution)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="overflow-x-auto overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Parameter</th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Symbol</th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Value</th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Unit</th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody>
                {result.parameter_audit_trail.map((entry, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">{entry.parameter}</td>
                    <td className="px-4 py-3 font-mono text-xs">{entry.symbol}</td>
                    <td className="px-4 py-3 font-mono text-xs" title={entry.value}>
                      {formatDecimal(entry.value)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.unit}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{entry.source}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
