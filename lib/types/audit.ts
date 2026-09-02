// Types for AuditLogResponse/AuditQueryResponse — see ROADMAP.md Phase 9
// writeup. Fully documented in the OpenAPI schema (unlike Calculations/
// Reports' undocumented endpoints), confirmed against a live call anyway.

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "PURGE"
  | "LOGIN"
  | "LOGOUT"
  | "PERMISSION_GRANT"
  | "PERMISSION_REVOKE"
  | "CONFIG_CHANGE"
  | "ERROR_OCCURRED";

export const AUDIT_ACTION_OPTIONS: AuditAction[] = [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "PURGE",
  "LOGIN",
  "LOGOUT",
  "PERMISSION_GRANT",
  "PERMISSION_REVOKE",
  "CONFIG_CHANGE",
  "ERROR_OCCURRED",
];

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export const AUDIT_SEVERITY_OPTIONS: AuditSeverity[] = ["INFO", "WARNING", "ERROR", "CRITICAL"];

export type AuditEntityType =
  | "USER"
  | "ORGANISATION"
  | "PROJECT"
  | "HOUSEHOLD"
  | "SURVEY"
  | "CALCULATION"
  | "METHODOLOGY"
  | "RETENTION_POLICY"
  | "AUDIT_LOG";

export const AUDIT_ENTITY_TYPE_OPTIONS: AuditEntityType[] = [
  "USER",
  "ORGANISATION",
  "PROJECT",
  "HOUSEHOLD",
  "SURVEY",
  "CALCULATION",
  "METHODOLOGY",
  "RETENTION_POLICY",
  "AUDIT_LOG",
];

// Described in the schema, not a formal enum type.
export type AuditStatus = "COMPLETED" | "FAILED" | "PENDING_RETENTION";

export type ChangeRecord = {
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  value_type: string;
  sensitive: boolean;
  masked: boolean;
};

export type EntitySnapshot = {
  snapshot_type: "BEFORE" | "AFTER";
  entity_type: string;
  values: Record<string, unknown>;
  timestamp: string;
};

export type AuditLog = {
  id: string;
  organisation_id: string;
  user_id: string | null;
  timestamp: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  severity: AuditSeverity;
  status: AuditStatus;
  changes: ChangeRecord[];
  before_snapshot: EntitySnapshot | null;
  after_snapshot: EntitySnapshot | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
};

export type AuditQueryResult = {
  audit_logs: AuditLog[];
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

export type AuditLogFilters = {
  user_id?: string;
  entity_type?: AuditEntityType;
  entity_id?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  date_from?: string;
  date_to?: string;
};

// Types for RetentionPolicyRequest/RetentionPolicyResponse. There is no GET
// endpoint to list configured policies — setting one is genuinely write-only
// on the backend as it stands, see ROADMAP.md Phase 10.
export type RetentionPolicyType = "GLOBAL" | "BY_ACTION" | "BY_ENTITY_TYPE";

export type RetentionPolicyInput = {
  policy_type: RetentionPolicyType;
  action_type?: AuditAction;
  entity_type?: AuditEntityType;
  retention_days: number;
  auto_delete: boolean;
  anonymize_on_delete: boolean;
};

export type RetentionPolicy = {
  id: string;
  organisation_id: string;
  policy_type: RetentionPolicyType;
  action_type: string | null;
  entity_type: string | null;
  retention_days: number;
  auto_delete: boolean;
  anonymize_on_delete: boolean;
  created_at: string;
  updated_at: string;
};
