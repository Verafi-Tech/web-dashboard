import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogsClient } from "@/components/audit/AuditLogsClient";
import type { AuditQueryResult } from "@/lib/types/audit";

const mockUseAuditLogs = jest.fn();
const mockUseUsers = jest.fn();

jest.mock("@/hooks/useAuditLogs", () => ({
  useAuditLogs: (...args: unknown[]) => mockUseAuditLogs(...args),
}));

jest.mock("@/hooks/useUsers", () => ({
  useUsers: () => mockUseUsers(),
}));

const result: AuditQueryResult = {
  audit_logs: [
    {
      id: "log-1",
      organisation_id: "org-1",
      user_id: null,
      timestamp: "2026-08-30T16:55:14.769194",
      action: "CREATE",
      entity_type: "PROJECT",
      entity_id: "f1c68836-019a-45b5-aad4-3e6065edbd97",
      severity: "INFO",
      status: "COMPLETED",
      changes: [],
      before_snapshot: null,
      after_snapshot: null,
      metadata: {},
      ip_address: null,
      user_agent: null,
    },
  ],
  total_count: 1,
  limit: 50,
  offset: 0,
  has_more: false,
};

beforeEach(() => {
  mockUseAuditLogs.mockReset();
  mockUseUsers.mockReturnValue({ data: [] });
});

describe("AuditLogsClient", () => {
  it("shows a loading skeleton", () => {
    mockUseAuditLogs.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = render(<AuditLogsClient />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    mockUseAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("network down"),
    });
    render(<AuditLogsClient />);

    expect(screen.getByText(/failed to load audit logs/i)).toBeInTheDocument();
  });

  it("shows an empty state when there are no matching logs", () => {
    mockUseAuditLogs.mockReturnValue({
      data: { audit_logs: [], total_count: 0, limit: 50, offset: 0, has_more: false },
      isLoading: false,
      isError: false,
    });
    render(<AuditLogsClient />);

    expect(screen.getByText(/no audit logs found/i)).toBeInTheDocument();
  });

  it("renders results and resets the page offset when a filter changes", () => {
    mockUseAuditLogs.mockReturnValue({ data: result, isLoading: false, isError: false });
    render(<AuditLogsClient />);

    expect(screen.getByText("1 total entry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/entity type/i), { target: { value: "PROJECT" } });

    const [filters, , offset] = mockUseAuditLogs.mock.calls.at(-1) ?? [];
    expect(filters).toEqual({ entity_type: "PROJECT" });
    expect(offset).toBe(0);
  });
});
