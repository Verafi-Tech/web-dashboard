"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { AuditLogFiltersBar } from "@/components/audit/AuditLogFiltersBar";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useUsers } from "@/hooks/useUsers";
import { getErrorMessage } from "@/lib/utils/errors";
import type { AuditLogFilters } from "@/lib/types/audit";

const PAGE_SIZE = 50;

export function AuditLogsClient() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError, error } = useAuditLogs(filters, PAGE_SIZE, offset);
  const users = useUsers();

  function onFiltersChange(next: AuditLogFilters) {
    setFilters(next);
    setOffset(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <AuditLogFiltersBar filters={filters} onChange={onFiltersChange} users={users.data ?? []} />

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={ScrollText}
          title="Failed to load audit logs"
          description={getErrorMessage(error)}
        />
      ) : !data || data.audit_logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit logs found"
          description="Try adjusting or clearing the filters above."
        />
      ) : (
        <>
          <AuditLogTable data={data.audit_logs} users={users.data ?? []} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {data.total_count} total {data.total_count === 1 ? "entry" : "entries"}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!data.has_more}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
