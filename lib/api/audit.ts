import { apiClient } from "@/lib/api/client";
import type {
  AuditLogFilters,
  AuditQueryResult,
  RetentionPolicy,
  RetentionPolicyInput,
} from "@/lib/types/audit";

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function listAuditLogs(
  filters: AuditLogFilters,
  limit: number,
  offset: number,
  organisationId?: string
): Promise<AuditQueryResult> {
  const res = await apiClient.get<AuditQueryResult>("/audit/logs", {
    params: { ...filters, limit, offset },
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function setRetentionPolicy(
  data: RetentionPolicyInput,
  organisationId?: string
): Promise<RetentionPolicy> {
  const res = await apiClient.post<RetentionPolicy>("/audit/retention-policies", data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

// Response schema is undocumented (additionalProperties: true) — confirmed
// live 2026-09-01: {purged_count: number, message: string}. Typed loosely
// and rendered defensively anyway rather than hard-coding that shape.
export async function purgeExpiredRecords(
  organisationId?: string
): Promise<Record<string, unknown>> {
  const res = await apiClient.post<Record<string, unknown>>(
    "/audit/purge",
    {},
    { headers: orgHeader(organisationId) }
  );
  return res.data;
}
