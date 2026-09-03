"use client";

import { useSession } from "next-auth/react";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useUsers } from "@/hooks/useUsers";
import { canViewAuditLogs } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/utils/errors";
import type { AuditAction, AuditEntityType, AuditLog } from "@/lib/types/audit";

const ACTION_VERBS: Record<AuditAction, string> = {
  CREATE: "created",
  READ: "viewed",
  UPDATE: "updated",
  DELETE: "deleted",
  EXPORT: "exported",
  PURGE: "purged",
  LOGIN: "logged in",
  LOGOUT: "logged out",
  PERMISSION_GRANT: "granted a permission on",
  PERMISSION_REVOKE: "revoked a permission on",
  CONFIG_CHANGE: "changed configuration for",
  ERROR_OCCURRED: "hit an error on",
};

// Spelled out with the correct article per entity — "user" takes "a" despite
// starting with a vowel letter, so a generic vowel-sound heuristic would get
// it wrong. The set of entity types is small and fixed, so just list them.
const ENTITY_LABELS: Record<AuditEntityType, string> = {
  USER: "a user",
  ORGANISATION: "an organisation",
  PROJECT: "a project",
  HOUSEHOLD: "a household",
  SURVEY: "a survey",
  CALCULATION: "a calculation",
  METHODOLOGY: "a methodology",
  RETENTION_POLICY: "a retention policy",
  AUDIT_LOG: "an audit log",
};

function describe(log: AuditLog, userName: string): string {
  const verb = ACTION_VERBS[log.action] ?? log.action.toLowerCase();
  if (log.action === "LOGIN" || log.action === "LOGOUT") {
    return `${userName} ${verb}`;
  }
  const entity = ENTITY_LABELS[log.entity_type] ?? log.entity_type.toLowerCase();
  return `${userName} ${verb} ${entity}`;
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentActivity() {
  const { data: session } = useSession();
  // Recent activity is sourced from audit logs, which are admin-only (same
  // gate as the dedicated Audit Logs page) — the underlying request is
  // disabled below for anyone else, not just the display.
  const canView = canViewAuditLogs(session?.activeOrganisationRole);
  const { data, isLoading, isError, error } = useAuditLogs(
    {},
    8,
    0,
    session?.activeOrganisationId,
    canView
  );
  const users = useUsers();

  if (!canView) {
    return (
      <EmptyState
        icon={Activity}
        title="No recent activity yet"
        description="Recent project, organisation, and user changes will show up here."
      />
    );
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={Activity}
        title="Failed to load recent activity"
        description={getErrorMessage(error)}
      />
    );
  }

  if (!data || data.audit_logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No recent activity yet"
        description="Actions across this organisation will show up here."
      />
    );
  }

  const usersById = new Map((users.data ?? []).map((u) => [u.id, u]));

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Recent activity</h3>
      </div>
      <ul className="divide-y divide-border">
        {data.audit_logs.map((log) => {
          const user = log.user_id ? usersById.get(log.user_id) : undefined;
          return (
            <li
              key={log.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="text-foreground">
                {describe(log, user?.full_name ?? "Someone")}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {relativeTime(log.timestamp)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
