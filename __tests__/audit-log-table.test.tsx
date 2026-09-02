import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import type { AuditLog } from "@/lib/types/audit";
import type { OrgUser } from "@/lib/types/user";

const user: OrgUser = {
  id: "u1",
  email: "jane@verafi.com",
  full_name: "Jane Doe",
  role: "admin",
  organisation_id: "org-1",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const log: AuditLog = {
  id: "log-1",
  organisation_id: "org-1",
  user_id: "u1",
  timestamp: "2026-08-30T16:55:14.769194",
  action: "UPDATE",
  entity_type: "PROJECT",
  entity_id: "f1c68836-019a-45b5-aad4-3e6065edbd97",
  severity: "WARNING",
  status: "COMPLETED",
  changes: [
    {
      field_name: "name",
      old_value: "Old Name",
      new_value: "New Name",
      value_type: "STRING",
      sensitive: false,
      masked: false,
    },
    {
      field_name: "email",
      old_value: "a@b.com",
      new_value: "c@d.com",
      value_type: "STRING",
      sensitive: true,
      masked: true,
    },
  ],
  before_snapshot: {
    snapshot_type: "BEFORE",
    entity_type: "PROJECT",
    values: { name: "Old Name" },
    timestamp: "2026-08-30T16:55:14.769194",
  },
  after_snapshot: null,
  metadata: {},
  ip_address: null,
  user_agent: null,
};

describe("AuditLogTable", () => {
  it("resolves the user id to a name and email", () => {
    render(<AuditLogTable data={[log]} users={[user]} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@verafi.com")).toBeInTheDocument();
  });

  it("falls back to a truncated id for an unknown user", () => {
    render(<AuditLogTable data={[log]} users={[]} />);

    expect(screen.getByText("u1…")).toBeInTheDocument();
  });

  it("shows System for a null user_id", () => {
    render(<AuditLogTable data={[{ ...log, user_id: null }]} users={[user]} />);

    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("expands a row to show changes and the before snapshot", () => {
    render(<AuditLogTable data={[log]} users={[user]} />);

    expect(screen.queryByText("Old Name")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("PROJECT", { exact: false }));

    expect(screen.getByText("New Name")).toBeInTheDocument();
    expect(screen.getByText("(redacted)")).toBeInTheDocument();
    expect(screen.getByText(/"name": "Old Name"/)).toBeInTheDocument();
  });
});
