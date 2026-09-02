import {
  isAdmin,
  canManageOrganisation,
  canInviteUsers,
  canManageUsers,
  canManageMethodologyTemplates,
  canManageProjects,
  canManageHouseholds,
  canViewAuditLogs,
  canViewSettings,
} from "@/lib/auth/permissions";

describe("permissions", () => {
  const allChecks = [
    isAdmin,
    canManageOrganisation,
    canInviteUsers,
    canManageUsers,
    canManageMethodologyTemplates,
    canManageProjects,
    canViewAuditLogs,
    canViewSettings,
  ];

  it("grants every permission to an admin", () => {
    for (const check of allChecks) {
      expect(check("admin")).toBe(true);
    }
  });

  it("denies every permission to a field agent", () => {
    for (const check of allChecks) {
      expect(check("field_agent")).toBe(false);
    }
  });

  it("denies every permission to a viewer", () => {
    for (const check of allChecks) {
      expect(check("viewer")).toBe(false);
    }
  });

  it("denies every permission when there's no role at all", () => {
    for (const check of allChecks) {
      expect(check(undefined)).toBe(false);
    }
  });
});

describe("canManageHouseholds", () => {
  it("allows admin and field_agent, but not viewer or no role", () => {
    expect(canManageHouseholds("admin")).toBe(true);
    expect(canManageHouseholds("field_agent")).toBe(true);
    expect(canManageHouseholds("viewer")).toBe(false);
    expect(canManageHouseholds(undefined)).toBe(false);
  });
});
