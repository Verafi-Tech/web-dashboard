import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import type { Project } from "@/lib/types/project";

const data: Project[] = [
  {
    id: "1",
    organisation_id: "org-1",
    name: "Cookstove Adoption — Lagos",
    methodology_id: "meth-1",
    country: "Nigeria",
    state: "Lagos",
    location: null,
    start_date: "2026-01-15",
    status: "active",
    verra_project_id: null,
    description: null,
    location_description: null,
    scale_category: null,
    crediting_period_start: null,
    crediting_period_end: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    organisation_id: "org-1",
    name: "Cookstove Adoption — Kano",
    methodology_id: "meth-1",
    country: "Nigeria",
    state: "Kano",
    location: null,
    start_date: "2025-06-01",
    status: "completed",
    verra_project_id: null,
    description: null,
    location_description: null,
    scale_category: null,
    crediting_period_start: null,
    crediting_period_end: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("ProjectsTable", () => {
  it("renders a row per project with a View link scoped to the active org by default", () => {
    render(<ProjectsTable data={data} />);

    expect(screen.getByText("Cookstove Adoption — Lagos")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View" })[0]).toHaveAttribute(
      "href",
      "/dashboard/projects/1"
    );
  });

  it("carries the organisation id through the View link when viewing a non-active org", () => {
    render(<ProjectsTable data={data} organisationId="org-1" />);

    expect(screen.getAllByRole("link", { name: "View" })[0]).toHaveAttribute(
      "href",
      "/dashboard/projects/1?org=org-1"
    );
  });

  it("filters by search term across project name", () => {
    render(<ProjectsTable data={data} />);

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: "Kano" },
    });

    expect(screen.queryByText("Cookstove Adoption — Lagos")).not.toBeInTheDocument();
    expect(screen.getByText("Cookstove Adoption — Kano")).toBeInTheDocument();
  });

  it("filters by status", () => {
    render(<ProjectsTable data={data} />);

    fireEvent.change(screen.getByDisplayValue("All statuses"), {
      target: { value: "completed" },
    });

    expect(screen.queryByText("Cookstove Adoption — Lagos")).not.toBeInTheDocument();
    expect(screen.getByText("Cookstove Adoption — Kano")).toBeInTheDocument();
  });
});
