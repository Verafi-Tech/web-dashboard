import type { UserRole } from "@/lib/types/user";

/**
 * Every role check for the app lives here, per-organisation role in, boolean
 * out. Components should call these, not compare `role === "admin"` inline —
 * when a Phase 2+ open question (e.g. "who can enrol a household") gets
 * answered, there's exactly one function to update, not a grep across every
 * component. See ROADMAP.md §7 for the source of each rule and which ones
 * are still open questions.
 */

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "admin";
}

// Create/update/delete organisation, remove a member (admin only per the API).
export function canManageOrganisation(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// POST /organisations/{id}/invite (admin only per the API).
export function canInviteUsers(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// GET /users/ (list) is admin only per the API — gates the whole Users section.
export function canManageUsers(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Create/update/delete a methodology's survey template (admin only per the API).
export function canManageMethodologyTemplates(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Create/update/delete a project, assign/remove project members (admin only
// per the API). Viewing a project or its member list is open to any org member.
export function canManageProjects(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Not documented by the API — resolved with the user 2026-08-29: field
// agents are the ones physically enrolling households, so enrol/edit/delete
// is admin OR field_agent (not viewer). A plain role check, not a
// project-membership check.
export function canManageHouseholds(role: UserRole | undefined): boolean {
  return role === "admin" || role === "field_agent";
}

// No dedicated audit-log endpoint restriction is documented — defaulting to
// admin-only since the page is still a stub (see ROADMAP.md Phase 9).
export function canViewAuditLogs(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Not documented by the API — resolved with the user 2026-08-30: unlike
// Households/Surveys (field-agent data entry), running a calculation feeds
// VVB-facing emissions numbers directly, so it's admin-only. Everyone can
// still view a project's calculations.
export function canManageCalculations(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// Not documented by the API — resolved with the user 2026-09-01: same class
// of action as Calculations (VVB-facing compliance artifact), so generating
// a report and recording a VVB approval/rejection are both admin-only.
// Everyone can still view a project's reports.
export function canManageReports(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

// No settings endpoints exist yet — defaulting to admin-only since the page
// is still a stub (see ROADMAP.md Phase 10).
export function canViewSettings(role: UserRole | undefined): boolean {
  return isAdmin(role);
}
