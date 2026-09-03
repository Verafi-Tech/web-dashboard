import { render, screen } from "@testing-library/react";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import type { AuditLog } from "@/lib/types/audit";

const mockUseSession = jest.fn();
const mockUseAuditLogs = jest.fn();
const mockUseUsers = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useAuditLogs", () => ({
  useAuditLogs: (...args: unknown[]) => mockUseAuditLogs(...args),
}));

jest.mock("@/hooks/useUsers", () => ({
  useUsers: () => mockUseUsers(),
}));

const log: AuditLog = {
  id: "log-1",
  organisation_id: "org-1",
  user_id: "u1",
  timestamp: new Date().toISOString(),
  action: "CREATE",
  entity_type: "PROJECT",
  entity_id: "p1",
  severity: "INFO",
  status: "COMPLETED",
  changes: [],
  before_snapshot: null,
  after_snapshot: null,
  metadata: {},
  ip_address: null,
  user_agent: null,
};

beforeEach(() => {
  mockUseUsers.mockReturnValue({ data: [{ id: "u1", full_name: "Jane Doe" }] });
});

describe("RecentActivity", () => {
  it("shows a plain empty state for a non-admin, without calling the audit-logs endpoint", () => {
    mockUseSession.mockReturnValue({
      data: { activeOrganisationRole: "field_agent", activeOrganisationId: "org-1" },
    });
    mockUseAuditLogs.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(<RecentActivity />);

    expect(screen.getByText(/no recent activity yet/i)).toBeInTheDocument();
    const [, , , , enabled] = mockUseAuditLogs.mock.calls.at(-1) ?? [];
    expect(enabled).toBe(false);
  });

  it("renders a described entry with the resolved user name for an admin", () => {
    mockUseSession.mockReturnValue({
      data: { activeOrganisationRole: "admin", activeOrganisationId: "org-1" },
    });
    mockUseAuditLogs.mockReturnValue({
      data: { audit_logs: [log], total_count: 1, limit: 8, offset: 0, has_more: false },
      isLoading: false,
      isError: false,
    });

    render(<RecentActivity />);

    expect(screen.getByText("Jane Doe created a project")).toBeInTheDocument();
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("falls back to 'Someone' when the user can't be resolved", () => {
    mockUseSession.mockReturnValue({
      data: { activeOrganisationRole: "admin", activeOrganisationId: "org-1" },
    });
    mockUseUsers.mockReturnValue({ data: [] });
    mockUseAuditLogs.mockReturnValue({
      data: { audit_logs: [log], total_count: 1, limit: 8, offset: 0, has_more: false },
      isLoading: false,
      isError: false,
    });

    render(<RecentActivity />);

    expect(screen.getByText("Someone created a project")).toBeInTheDocument();
  });

  it("uses the correct article per entity type (a user, an audit log)", () => {
    mockUseSession.mockReturnValue({
      data: { activeOrganisationRole: "admin", activeOrganisationId: "org-1" },
    });
    mockUseAuditLogs.mockReturnValue({
      data: {
        audit_logs: [
          { ...log, id: "l1", user_id: null, action: "PURGE", entity_type: "AUDIT_LOG" },
        ],
        total_count: 1,
        limit: 8,
        offset: 0,
        has_more: false,
      },
      isLoading: false,
      isError: false,
    });

    render(<RecentActivity />);

    expect(screen.getByText("Someone purged an audit log")).toBeInTheDocument();
  });

  it("shows an error state when the audit log fetch fails", () => {
    mockUseSession.mockReturnValue({
      data: { activeOrganisationRole: "admin", activeOrganisationId: "org-1" },
    });
    mockUseAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("network down"),
    });

    render(<RecentActivity />);

    expect(screen.getByText(/failed to load recent activity/i)).toBeInTheDocument();
  });
});
