import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDecimal } from "@/lib/utils/format";
import type { CalculationStatus, CalculationSummary } from "@/lib/types/calculation";

const STATUS_VARIANT: Record<CalculationStatus, "success" | "info" | "danger"> = {
  COMPLETED: "success",
  IN_PROGRESS: "info",
  FAILED: "danger",
};

function calculationHref(
  projectId: string,
  calculationId: string,
  organisationId?: string
) {
  const base = `/dashboard/projects/${projectId}/calculations/${calculationId}`;
  return organisationId ? `${base}?org=${organisationId}` : base;
}

export function CalculationsTable({
  data,
  projectId,
  organisationId,
}: {
  data: CalculationSummary[];
  projectId: string;
  organisationId?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Year
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Net reductions (tCO2e)
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Calculated
            </th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {data.map((calc) => (
            <tr key={calc.calculation_id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 font-semibold text-foreground">{calc.year}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[calc.status]}>{calc.status}</Badge>
              </td>
              <td
                className="px-4 py-3 font-mono text-xs text-foreground"
                title={calc.net_emission_reductions}
              >
                {formatDecimal(calc.net_emission_reductions)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(calc.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={calculationHref(projectId, calc.calculation_id, organisationId)}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
