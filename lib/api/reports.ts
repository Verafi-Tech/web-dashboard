import { apiClient } from "@/lib/api/client";
import type { Report, ReportGenerationInput, ReportApprovalInput } from "@/lib/types/report";

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function generateReport(
  projectId: string,
  data: ReportGenerationInput,
  organisationId?: string
): Promise<Report> {
  const res = await apiClient.post<Report>(
    `/projects/${projectId}/reports`,
    { project_id: projectId, ...data },
    { headers: orgHeader(organisationId) }
  );
  return res.data;
}

// The list response schema is an untyped object in the live OpenAPI doc
// (additionalProperties: true) — confirmed against the live backend
// 2026-09-01: {items: [...], total, skip, limit}. Each item is a full
// Report, unlike Calculations' list endpoint which returns a flatter
// summary shape — no separate summary type needed here.
export async function listReports(
  projectId: string,
  organisationId?: string
): Promise<Report[]> {
  const res = await apiClient.get<{ items: Report[] }>(`/projects/${projectId}/reports`, {
    headers: orgHeader(organisationId),
  });
  return res.data.items;
}

export async function getReport(id: string, organisationId?: string): Promise<Report> {
  const res = await apiClient.get<Report>(`/reports/${id}`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

// Confirmed against the live backend 2026-09-01: {status: "success", html:
// "<!DOCTYPE html>..."} — a complete standalone document, meant for an
// iframe (srcDoc), not for parsing.
export async function getReportHtml(id: string, organisationId?: string): Promise<string> {
  const res = await apiClient.get<{ status: string; html: string }>(`/reports/${id}/html`, {
    headers: orgHeader(organisationId),
  });
  return res.data.html;
}

// Confirmed against the live backend 2026-09-01: raw application/pdf bytes
// with a Content-Disposition header — a real file, not JSON despite the
// OpenAPI doc's empty schema. responseType: "blob" is required or axios
// would try to parse the binary as text/JSON.
export async function downloadReportPdf(id: string, organisationId?: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/reports/${id}/pdf`, {
    responseType: "blob",
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function approveReport(
  id: string,
  data: ReportApprovalInput,
  organisationId?: string
): Promise<Report> {
  const res = await apiClient.post<Report>(`/reports/${id}/approve`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}
