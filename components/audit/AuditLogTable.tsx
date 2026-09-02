"use client";

import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AuditLog, AuditSeverity } from "@/lib/types/audit";
import type { OrgUser } from "@/lib/types/user";

const SEVERITY_VARIANT: Record<AuditSeverity, "info" | "warn" | "danger"> = {
  INFO: "info",
  WARNING: "warn",
  ERROR: "danger",
  CRITICAL: "danger",
};

function shortId(id: string) {
  return `${id.slice(0, 8)}…`;
}

function ChangesList({ changes }: { changes: AuditLog["changes"] }) {
  if (changes.length === 0) {
    return <p className="text-xs text-muted-foreground">No field-level changes recorded.</p>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {changes.map((change, i) => (
        <li key={i} className="font-mono text-xs">
          <span className="font-semibold text-foreground">{change.field_name}</span>:{" "}
          {change.masked ? (
            <span className="text-muted-foreground">(redacted)</span>
          ) : (
            <>
              <span className="text-muted-foreground">{change.old_value ?? "—"}</span>
              {" → "}
              <span className="text-foreground">{change.new_value ?? "—"}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function SnapshotDump({ snapshot }: { snapshot: AuditLog["before_snapshot"] }) {
  if (!snapshot) {
    return <p className="text-xs text-muted-foreground">Not recorded.</p>;
  }
  return (
    <pre className="max-h-64 overflow-auto rounded-md bg-muted/30 p-2 font-mono text-[11px] text-foreground">
      {JSON.stringify(snapshot.values, null, 2)}
    </pre>
  );
}

export function AuditLogTable({ data, users }: { data: AuditLog[]; users: OrgUser[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const usersById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5" />
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Timestamp
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Action
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Entity
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              User
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Severity
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((log) => {
            const isExpanded = expandedId === log.id;
            const user = log.user_id ? usersById.get(log.user_id) : undefined;
            return (
              <Fragment key={log.id}>
                <tr
                  className="cursor-pointer border-t border-border hover:bg-muted/30"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="draft">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground" title={log.entity_id}>
                    {log.entity_type} · {shortId(log.entity_id)}
                  </td>
                  <td className="px-4 py-3">
                    {user ? (
                      <>
                        <div className="font-semibold text-foreground">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </>
                    ) : log.user_id ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortId(log.user_id)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={SEVERITY_VARIANT[log.severity]}>{log.severity}</Badge>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <h4 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                            Changes
                          </h4>
                          <ChangesList changes={log.changes} />
                        </div>
                        <div>
                          <h4 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                            Before
                          </h4>
                          <SnapshotDump snapshot={log.before_snapshot} />
                        </div>
                        <div>
                          <h4 className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                            After
                          </h4>
                          <SnapshotDump snapshot={log.after_snapshot} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
