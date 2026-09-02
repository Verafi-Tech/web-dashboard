import { render, screen } from "@testing-library/react";
import { HouseholdsTable } from "@/components/households/HouseholdsTable";
import type { Household } from "@/lib/types/household";

const household: Household = {
  id: "h1",
  project_id: "p1",
  enrolled_by: "u1",
  household_code: "HH-001",
  head_of_household: "Jane Doe",
  household_size: 4,
  hh_equiv_adults: "3.2",
  hh_children_0_14: 1,
  hh_female_over_14: 2,
  hh_male_15_59: 1,
  hh_male_over_59: 0,
  old_stove_type: "three-stone",
  primary_fuel_type: "firewood",
  photo_old_stove_url: null,
  new_stove_type: "improved-cookstove",
  stove_serial_number: null,
  enrolment_date: "2026-01-15",
  sync_status: "synced",
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-01-15T00:00:00Z",
  community: "Ojo",
};

describe("HouseholdsTable", () => {
  it("renders a row with a View link scoped to the project", () => {
    render(<HouseholdsTable data={[household]} projectId="p1" />);

    expect(screen.getByText("HH-001")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/dashboard/projects/p1/households/h1"
    );
  });

  it("carries the organisation id through the View link when provided", () => {
    render(<HouseholdsTable data={[household]} projectId="p1" organisationId="org-1" />);

    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/dashboard/projects/p1/households/h1?org=org-1"
    );
  });

  it("shows a dash when there's no head of household on file", () => {
    render(
      <HouseholdsTable
        data={[{ ...household, head_of_household: null }]}
        projectId="p1"
      />
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
