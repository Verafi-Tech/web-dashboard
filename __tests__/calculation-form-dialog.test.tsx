import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalculationFormDialog } from "@/components/calculations/CalculationFormDialog";
import type { Household } from "@/lib/types/household";

const mockCreateMutateAsync = jest.fn();
const mockUseHouseholds = jest.fn();

jest.mock("@/hooks/useCalculation", () => ({
  useCreateCalculation: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
}));

jest.mock("@/hooks/useHouseholds", () => ({
  useHouseholds: () => mockUseHouseholds(),
}));

function household(overrides: Partial<Household>): Household {
  return {
    id: "h1",
    project_id: "p1",
    enrolled_by: "u1",
    household_code: "HH-001",
    head_of_household: null,
    household_size: 4,
    hh_equiv_adults: null,
    hh_children_0_14: 0,
    hh_female_over_14: 0,
    hh_male_15_59: 0,
    hh_male_over_59: 0,
    old_stove_type: null,
    primary_fuel_type: null,
    photo_old_stove_url: null,
    new_stove_type: null,
    stove_serial_number: null,
    enrolment_date: "2026-01-01",
    sync_status: "synced",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    community: null,
    ...overrides,
  };
}

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
  mockUseHouseholds.mockReturnValue({ data: [], isLoading: false });
});

describe("CalculationFormDialog", () => {
  it("shows validation errors when required arrays are empty", async () => {
    render(
      <CalculationFormDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.change(screen.getByLabelText(/calculation year/i), { target: { value: "2026" } });
    fireEvent.change(screen.getByLabelText(/children 0-14/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/females 15\+/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/males 15-59/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/males 60\+/i), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: /run calculation/i }));

    expect(await screen.findByText(/add at least one baseline device/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("sums household composition across the project's households on prefill", () => {
    mockUseHouseholds.mockReturnValue({
      data: [
        household({ hh_children_0_14: 2, hh_female_over_14: 1, hh_male_15_59: 1, hh_male_over_59: 0 }),
        household({ hh_children_0_14: 1, hh_female_over_14: 1, hh_male_15_59: 2, hh_male_over_59: 1 }),
      ],
      isLoading: false,
    });
    render(
      <CalculationFormDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.click(screen.getByRole("button", { name: /prefill from households/i }));

    expect(screen.getByLabelText(/children 0-14/i)).toHaveValue(3);
    expect(screen.getByLabelText(/females 15\+/i)).toHaveValue(2);
    expect(screen.getByLabelText(/males 15-59/i)).toHaveValue(3);
    expect(screen.getByLabelText(/males 60\+/i)).toHaveValue(1);
  });

  it("disables prefill when the project has no households", () => {
    render(
      <CalculationFormDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    expect(screen.getByRole("button", { name: /prefill from households/i })).toBeDisabled();
  });

  it("adds and removes a baseline device row", () => {
    render(
      <CalculationFormDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.click(screen.getByRole("button", { name: /add baseline device/i }));
    expect(screen.getByPlaceholderText(/three-stone-fire/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove baseline device/i }));
    expect(screen.queryByPlaceholderText(/three-stone-fire/i)).not.toBeInTheDocument();
  });

  it("requires customer support level for survey-based monitoring (CC Clarification 2)", async () => {
    render(
      <CalculationFormDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.click(screen.getByRole("button", { name: /add monitoring entry/i }));
    // Method defaults to SURVEY; leave customer support level unset.
    fireEvent.change(screen.getByLabelText(/usage rate \(fraction/i), { target: { value: "0.8" } });
    fireEvent.click(screen.getByRole("button", { name: /run calculation/i }));

    expect(
      await screen.findByText(/required for survey-based monitoring/i)
    ).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits a full calculation request built from one row per section", async () => {
    mockCreateMutateAsync.mockResolvedValue({});
    const onOpenChange = jest.fn();
    render(
      <CalculationFormDialog open onOpenChange={onOpenChange} projectId="p1" />
    );

    fireEvent.change(screen.getByLabelText(/calculation year/i), { target: { value: "2026" } });
    fireEvent.change(screen.getByLabelText(/children 0-14/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/females 15\+/i), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText(/males 15-59/i), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/males 60\+/i), { target: { value: "2" } });

    fireEvent.click(screen.getByRole("button", { name: /add baseline device/i }));
    fireEvent.change(screen.getByPlaceholderText(/three-stone-fire/i), {
      target: { value: "old-stove" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add consumption entry/i }));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "old-stove" })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/^baseline device$/i), {
      target: { value: "old-stove" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add project device/i }));
    fireEvent.change(screen.getByPlaceholderText(/rocket-stove/i), {
      target: { value: "new-stove" },
    });
    fireEvent.change(screen.getByPlaceholderText(/batch-2026-q1/i), {
      target: { value: "batch-a" },
    });
    fireEvent.change(screen.getByLabelText(/project thermal efficiency/i), {
      target: { value: "0.3" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add monitoring entry/i }));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "new-stove" })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/^project device$/i), {
      target: { value: "new-stove" },
    });
    fireEvent.change(screen.getByLabelText(/monitoring batch/i), { target: { value: "batch-a" } });
    fireEvent.change(screen.getByLabelText(/monitoring year/i), { target: { value: "2026" } });
    fireEvent.change(screen.getByLabelText(/number of devices/i), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/usage rate \(fraction/i), { target: { value: "0.8" } });
    fireEvent.change(screen.getByLabelText(/customer support level/i), {
      target: { value: "FULL_SUPPORT" },
    });

    fireEvent.click(screen.getByRole("button", { name: /run calculation/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: "p1",
          year_y: 2026,
          household_composition: {
            children_0_14: 10,
            females_over_14: 8,
            males_15_59: 7,
            males_over_59: 2,
          },
          baseline_devices: expect.arrayContaining([
            expect.objectContaining({ device_type_i: "old-stove", fuel_type: "FIREWOOD" }),
          ]),
          baseline_consumption: expect.arrayContaining([
            expect.objectContaining({ baseline_device_i: "old-stove" }),
          ]),
          project_devices: expect.arrayContaining([
            expect.objectContaining({
              device_type_j: "new-stove",
              batch_k: "batch-a",
              efficiency: 0.3,
            }),
          ]),
          monitoring_data: expect.arrayContaining([
            expect.objectContaining({
              device_type_j: "new-stove",
              batch_k: "batch-a",
              year_y: 2026,
              n_devices: 50,
              usage_rate_data: expect.objectContaining({ raw_rate: 0.8 }),
            }),
          ]),
        })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  }, 15000);
});
