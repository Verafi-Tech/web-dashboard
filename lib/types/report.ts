// Types for ReportGenerationRequest/ReportResponse — see ROADMAP.md Phase 7
// writeup for the endpoints these were verified against (several are
// undocumented in the OpenAPI schema and were confirmed with real
// authenticated calls). Decimal fields (usage_rate, tco2e_reduced) come back
// as strings, same convention as Calculations — display-only, never computed
// on client-side.

export type ReportStatus = "DRAFT" | "VERIFIED" | "REJECTED" | "ARCHIVED";

export type UsageRateMethod = "SUMS" | "SURVEYS";

export type CustomerSupportLevel = "FULL" | "PARTIAL";

export type ReportApprovalLog = {
  id: string;
  from_status: string;
  to_status: string;
  vvb_name: string | null;
  vvb_comments: string | null;
  changed_at: string;
};

export type Report = {
  id: string;
  project_id: string;
  organisation_id: string;
  created_by_user_id: string | null;
  period_start: string;
  period_end: string;
  usage_rate_method: UsageRateMethod;
  customer_support_level: CustomerSupportLevel | null;
  usage_rate: string;
  tco2e_reduced: string;
  status: ReportStatus;
  version: string;
  created_at: string;
  updated_at: string;
  sections_count: number | null;
  parameters_count: number | null;
  approval_logs: ReportApprovalLog[] | null;
};

export type ReportGenerationInput = {
  period_start: string;
  period_end: string;
  usage_rate_method: UsageRateMethod;
  customer_support_level?: CustomerSupportLevel;
};

export type ReportApprovalInput = {
  status: "VERIFIED" | "REJECTED";
  vvb_name: string;
  vvb_comments?: string;
};
