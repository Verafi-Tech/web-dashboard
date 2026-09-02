import { apiClient } from "@/lib/api/client";
import type {
  CalculationResponse,
  CalculationSummary,
  VM0050CalculationRequest,
} from "@/lib/types/calculation";

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function createCalculation(
  projectId: string,
  data: VM0050CalculationRequest,
  organisationId?: string
): Promise<CalculationResponse> {
  const res = await apiClient.post<CalculationResponse>(
    `/projects/${projectId}/calculations`,
    data,
    { headers: orgHeader(organisationId) }
  );
  return res.data;
}

// The list response schema is an untyped object in the live OpenAPI doc
// (additionalProperties: true) rather than a documented {data, meta} or bare
// array shape like other list endpoints. Confirmed against the live backend
// 2026-08-30: it's {calculations: [...], total_count, limit, offset}, and
// each row is a flat CalculationSummary — NOT the full CalculationResponse
// the create/get endpoints return. Normalize defensively so a bare array,
// {data: [...]}, or {items: [...]} would also work if this ever changes.
export async function listCalculations(
  projectId: string,
  organisationId?: string
): Promise<CalculationSummary[]> {
  const res = await apiClient.get<unknown>(`/projects/${projectId}/calculations`, {
    headers: orgHeader(organisationId),
  });
  const body = res.data;
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.calculations)) return record.calculations as CalculationSummary[];
    if (Array.isArray(record.data)) return record.data as CalculationSummary[];
    if (Array.isArray(record.items)) return record.items as CalculationSummary[];
  }
  return [];
}

export async function getCalculation(
  calculationId: string,
  organisationId?: string
): Promise<CalculationResponse> {
  const res = await apiClient.get<CalculationResponse>(`/calculations/${calculationId}`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}
