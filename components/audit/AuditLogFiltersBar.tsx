"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_SEVERITY_OPTIONS,
  AUDIT_ENTITY_TYPE_OPTIONS,
} from "@/lib/types/audit";
import type { AuditLogFilters, AuditAction, AuditSeverity, AuditEntityType } from "@/lib/types/audit";
import type { OrgUser } from "@/lib/types/user";

export function AuditLogFiltersBar({
  filters,
  onChange,
  users,
}: {
  filters: AuditLogFilters;
  onChange: (filters: AuditLogFilters) => void;
  users: OrgUser[];
}) {
  function set<K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) {
    onChange({ ...filters, [key]: value || undefined });
  }

  const hasFilters = Object.values(filters).some((v) => !!v);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-entity-type" className="text-[10.5px]">
          Entity type
        </Label>
        <Select
          id="audit-filter-entity-type"
          className="w-40"
          value={filters.entity_type ?? ""}
          onChange={(e) => set("entity_type", e.target.value as AuditEntityType)}
        >
          <option value="">All</option>
          {AUDIT_ENTITY_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-action" className="text-[10.5px]">
          Action
        </Label>
        <Select
          id="audit-filter-action"
          className="w-40"
          value={filters.action ?? ""}
          onChange={(e) => set("action", e.target.value as AuditAction)}
        >
          <option value="">All</option>
          {AUDIT_ACTION_OPTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-severity" className="text-[10.5px]">
          Severity
        </Label>
        <Select
          id="audit-filter-severity"
          className="w-32"
          value={filters.severity ?? ""}
          onChange={(e) => set("severity", e.target.value as AuditSeverity)}
        >
          <option value="">All</option>
          {AUDIT_SEVERITY_OPTIONS.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-user" className="text-[10.5px]">
          User
        </Label>
        <Select
          id="audit-filter-user"
          className="w-40"
          value={filters.user_id ?? ""}
          onChange={(e) => set("user_id", e.target.value)}
        >
          <option value="">All users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-entity-id" className="text-[10.5px]">
          Entity ID
        </Label>
        <Input
          id="audit-filter-entity-id"
          className="w-40"
          placeholder="UUID"
          value={filters.entity_id ?? ""}
          onChange={(e) => set("entity_id", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-date-from" className="text-[10.5px]">
          From
        </Label>
        <Input
          id="audit-filter-date-from"
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => set("date_from", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-filter-date-to" className="text-[10.5px]">
          To
        </Label>
        <Input
          id="audit-filter-date-to"
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => set("date_to", e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
