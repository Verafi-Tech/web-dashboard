import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDecimal } from "@/lib/utils/format";
import type { Report, ReportStatus } from "@/lib/types/report";

const STATUS_VARIANT: Record<ReportStatus, "success" | "info" | "danger" | "draft"> = {
  DRAFT: "draft",
  VERIFIED: "success",
  REJECTED: "danger",
  ARCHIVED: "info",
};

function reportHref(projectId: string, reportId: string, organisationId?: string) {
  const base = `/dashboard/projects/${projectId}/reports/${reportId}`;
  return organisationId ? `${base}?org=${organisationId}` : base;
}

export function ReportsTable({
  data,
  projectId,
  organisationId,
}: {
  data: Report[];
  projectId: string;
  organisationId?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Period
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              tCO2e reduced
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Version
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Created
            </th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {data.map((report) => (
            <tr key={report.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 font-semibold text-foreground">
                {new Date(report.period_start).toLocaleDateString()} –{" "}
                {new Date(report.period_end).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[report.status]}>{report.status}</Badge>
              </td>
              <td
                className="px-4 py-3 font-mono text-xs text-foreground"
                title={report.tco2e_reduced}
              >
                {formatDecimal(report.tco2e_reduced)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{report.version}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(report.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={reportHref(projectId, report.id, organisationId)}
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
