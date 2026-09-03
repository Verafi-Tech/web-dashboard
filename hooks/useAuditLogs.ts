import { useQuery } from "@tanstack/react-query";
import { listAuditLogs } from "@/lib/api/audit";
import type { AuditLogFilters } from "@/lib/types/audit";

export function useAuditLogs(
  filters: AuditLogFilters,
  limit: number,
  offset: number,
  organisationId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["audit-logs", filters, limit, offset, organisationId],
    queryFn: () => listAuditLogs(filters, limit, offset, organisationId),
    enabled,
  });
}
