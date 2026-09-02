import { render, screen, fireEvent } from "@testing-library/react";
import { SurveysTable } from "@/components/surveys/SurveysTable";
import type { Survey } from "@/lib/types/survey";

const survey: Survey = {
  id: "s1",
  household_id: "h1",
  surveyed_by: "u1",
  survey_date: "2026-03-01",
  stove_in_use: true,
  stove_used_regularly: true,
  stove_in_good_condition: false,
  primary_fuel_used: "firewood",
  old_stove_still_used: false,
  meals_on_project_stove: 14,
  meals_on_baseline_stove: 2,
  firewood_kg_per_week: "5.5",
  photo_stove_url: null,
  photo_cooking_area_url: null,
  notes: "Stove needs a new grate",
  sync_status: "synced",
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

describe("SurveysTable", () => {
  it("renders stove status badges and notes", () => {
    render(
      <SurveysTable data={[survey]} canManage={false} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.getByText("In use")).toBeInTheDocument();
    expect(screen.getByText("Needs repair")).toBeInTheDocument();
    expect(screen.getByText("firewood")).toBeInTheDocument();
    expect(screen.getByText("Stove needs a new grate")).toBeInTheDocument();
  });

  it("hides edit/delete actions for a non-managing viewer", () => {
    render(
      <SurveysTable data={[survey]} canManage={false} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.queryByRole("button", { name: /edit survey/i })).not.toBeInTheDocument();
  });

  it("calls onEdit and onDelete when their buttons are clicked", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<SurveysTable data={[survey]} canManage onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /edit survey/i }));
    expect(onEdit).toHaveBeenCalledWith(survey);

    fireEvent.click(screen.getByRole("button", { name: /delete survey/i }));
    expect(onDelete).toHaveBeenCalledWith(survey);
  });
});
