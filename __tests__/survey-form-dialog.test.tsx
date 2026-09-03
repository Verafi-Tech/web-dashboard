import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SurveyFormDialog } from "@/components/surveys/SurveyFormDialog";
import type { Survey } from "@/lib/types/survey";

const mockCreateMutateAsync = jest.fn();
const mockUpdateMutateAsync = jest.fn();

jest.mock("@/hooks/useSurvey", () => ({
  useCreateSurvey: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
  useUpdateSurvey: () => ({ mutateAsync: mockUpdateMutateAsync, isPending: false }),
}));

jest.mock("@/hooks/useUpload", () => ({
  useUploadFile: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDownloadUrl: () => ({ data: undefined, isLoading: false }),
}));

const survey: Survey = {
  id: "s1",
  household_id: "h1",
  surveyed_by: "u1",
  survey_date: "2026-03-01",
  stove_in_use: true,
  stove_used_regularly: false,
  stove_in_good_condition: true,
  primary_fuel_used: "firewood",
  old_stove_still_used: false,
  meals_on_project_stove: 10,
  meals_on_baseline_stove: null,
  firewood_kg_per_week: "3.2",
  photo_stove_url: null,
  photo_cooking_area_url: null,
  notes: null,
  sync_status: "synced",
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
  mockUpdateMutateAsync.mockReset();
});

describe("SurveyFormDialog", () => {
  it("shows a validation error when survey date is missing (create mode)", async () => {
    render(
      <SurveyFormDialog open onOpenChange={jest.fn()} householdId="h1" />
    );

    fireEvent.click(screen.getByRole("button", { name: /record survey/i }));

    expect(await screen.findByText(/survey date is required/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a survey date in the future (matches a live backend 422)", async () => {
    render(
      <SurveyFormDialog open onOpenChange={jest.fn()} householdId="h1" />
    );

    fireEvent.change(screen.getByLabelText(/survey date/i), {
      target: { value: "2099-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /record survey/i }));

    expect(await screen.findByText(/cannot be in the future/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a fractional meal count (backend types it as an integer)", async () => {
    render(
      <SurveyFormDialog open onOpenChange={jest.fn()} householdId="h1" />
    );

    fireEvent.change(screen.getByLabelText(/survey date/i), {
      target: { value: "2026-03-01" },
    });
    fireEvent.change(screen.getByLabelText(/meals on project stove/i), {
      target: { value: "2.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /record survey/i }));

    expect(await screen.findByText(/must be a whole number/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a new survey with default booleans and converted numeric fields", async () => {
    // Base UI's Switch dispatches a synthetic pointer event on click that
    // jsdom doesn't implement (no PointerEvent constructor) — the same gap
    // user-profile.test.tsx works around by not exercising the toggle
    // interaction either. This asserts the (all-false) defaults submit
    // correctly rather than fighting that jsdom limitation.
    mockCreateMutateAsync.mockResolvedValue(survey);
    const onOpenChange = jest.fn();
    render(
      <SurveyFormDialog open onOpenChange={onOpenChange} householdId="h1" />
    );

    fireEvent.change(screen.getByLabelText(/survey date/i), {
      target: { value: "2026-03-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /record survey/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          survey_date: "2026-03-01",
          stove_in_use: false,
          stove_used_regularly: false,
          meals_on_project_stove: undefined,
        })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("pre-fills the form and calls update in edit mode", async () => {
    mockUpdateMutateAsync.mockResolvedValue(survey);
    render(
      <SurveyFormDialog open onOpenChange={jest.fn()} householdId="h1" survey={survey} />
    );

    expect(screen.getByText(/edit survey/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("firewood")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ survey_date: "2026-03-01", primary_fuel_used: "firewood" })
      );
    });
  });
});
