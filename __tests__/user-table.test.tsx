import { render, screen, fireEvent } from "@testing-library/react";
import { UserTable } from "@/components/users/UserTable";
import type { OrgUser } from "@/lib/types/user";

const data: OrgUser[] = [
  {
    id: "1",
    email: "admin@verafi.com",
    full_name: "Admin User",
    role: "admin",
    organisation_id: "org-1",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "field@verafi.com",
    full_name: "Field Agent",
    role: "field_agent",
    organisation_id: "org-1",
    is_active: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("UserTable", () => {
  it("renders a row per user with a View link", () => {
    render(<UserTable data={data} />);

    expect(screen.getByText("admin@verafi.com")).toBeInTheDocument();
    expect(screen.getByText("field@verafi.com")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View" })[0]).toHaveAttribute(
      "href",
      "/dashboard/users/1"
    );
  });

  it("filters by search term across email and name", () => {
    render(<UserTable data={data} />);

    fireEvent.change(screen.getByPlaceholderText(/search by email or name/i), {
      target: { value: "field" },
    });

    expect(screen.queryByText("admin@verafi.com")).not.toBeInTheDocument();
    expect(screen.getByText("field@verafi.com")).toBeInTheDocument();
  });

  it("filters by role", () => {
    render(<UserTable data={data} />);

    fireEvent.change(screen.getByDisplayValue("All roles"), {
      target: { value: "admin" },
    });

    expect(screen.getByText("admin@verafi.com")).toBeInTheDocument();
    expect(screen.queryByText("field@verafi.com")).not.toBeInTheDocument();
  });

  it("filters by status", () => {
    render(<UserTable data={data} />);

    fireEvent.change(screen.getByDisplayValue("All statuses"), {
      target: { value: "suspended" },
    });

    expect(screen.queryByText("admin@verafi.com")).not.toBeInTheDocument();
    expect(screen.getByText("field@verafi.com")).toBeInTheDocument();
  });
});
