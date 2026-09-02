"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ApproveReportDialog } from "@/components/reports/ApproveReportDialog";
import { useReport } from "@/hooks/useReport";
import { useProject } from "@/hooks/useProject";
import { getReportHtml, downloadReportPdf } from "@/lib/api/reports";
import { getErrorMessage } from "@/lib/utils/errors";
import { formatDecimal } from "@/lib/utils/format";
import { canManageReports } from "@/lib/auth/permissions";
import type { ReportStatus } from "@/lib/types/report";

const STATUS_VARIANT: Record<ReportStatus, "success" | "info" | "danger" | "draft"> = {
  DRAFT: "draft",
  VERIFIED: "success",
  REJECTED: "danger",
  ARCHIVED: "info",
};

function projectHref(projectId: string, organisationId?: string) {
  return organisationId
    ? `/dashboard/projects/${projectId}?org=${organisationId}`
    : `/dashboard/projects/${projectId}`;
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

export function ReportDetailClient({
  reportId,
  projectId,
  organisationId,
}: {
  reportId: string;
  projectId: string;
  organisationId?: string;
}) {
  const { data: session } = useSession();
  const { data: report, isLoading, isError, error } = useReport(reportId, organisationId);
  const { data: project } = useProject(projectId, organisationId);
  const membership = session?.organisations.find(
    (org) => org.id === project?.organisation_id
  );
  const canManage = canManageReports(membership?.role);
  const [approveOpen, setApproveOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfPending, setPdfPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReportHtml(reportId, organisationId)
      .then((value) => {
        if (!cancelled) {
          setHtml(value);
          setHtmlError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setHtml(null);
          setHtmlError(getErrorMessage(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reportId, organisationId]);

  async function onDownloadPdf() {
    setPdfError(null);
    setPdfPending(true);
    try {
      const blob = await downloadReportPdf(reportId, organisationId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPdfError(getErrorMessage(error));
    } finally {
      setPdfPending(false);
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !report) {
    return (
      <EmptyState
        icon={FileText}
        title="Failed to load report"
        description={error ? getErrorMessage(error) : "Report not found."}
      />
    );
  }

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
          Monitoring report — {new Date(report.period_start).toLocaleDateString()} to{" "}
          {new Date(report.period_end).toLocaleDateString()}
        </h2>
        <Badge variant={STATUS_VARIANT[report.status]}>{report.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="tCO2e reduced" value={formatDecimal(report.tco2e_reduced)} />
        <StatCard label="Usage rate" value={formatDecimal(report.usage_rate)} />
        <StatCard label="Method" value={report.usage_rate_method} />
        <StatCard label="Version" value={report.version} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onDownloadPdf} disabled={pdfPending}>
          <Download className="size-4" />
          {pdfPending ? "Preparing…" : "Download PDF"}
        </Button>
        {canManage && report.status === "DRAFT" && (
          <Button onClick={() => setApproveOpen(true)}>Record VVB decision</Button>
        )}
      </div>
      {pdfError && <p className="text-sm text-destructive">{pdfError}</p>}

      <div>
        <h3 className="mb-2 text-sm font-bold text-foreground">Report preview</h3>
        {htmlError ? (
          <EmptyState icon={FileText} title="Failed to load preview" description={htmlError} />
        ) : html ? (
          <iframe
            title="Report preview"
            srcDoc={html}
            sandbox=""
            className="h-150 w-full rounded-lg border border-border bg-white"
          />
        ) : (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-foreground">Approval history</h3>
        {!report.approval_logs || report.approval_logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approval decisions recorded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Status change
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    VVB
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Comments
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Changed
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.approval_logs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {log.from_status} → {log.to_status}
                    </td>
                    <td className="px-4 py-3">{log.vvb_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.vvb_comments || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(log.changed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage && (
        <ApproveReportDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          reportId={reportId}
          projectId={projectId}
          organisationId={organisationId}
        />
      )}
    </div>
  );
}
