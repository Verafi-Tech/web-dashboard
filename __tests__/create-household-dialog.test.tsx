import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateHouseholdDialog } from "@/components/households/CreateHouseholdDialog";

const mockCreateMutateAsync = jest.fn();

jest.mock("@/hooks/useHousehold", () => ({
  useCreateHousehold: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

jest.mock("@/hooks/useUpload", () => ({
  useUploadFile: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDownloadUrl: () => ({ data: undefined, isLoading: false }),
}));

const household = {
  id: "h1",
  project_id: "p1",
  enrolled_by: "u1",
  household_code: "HH-001",
  head_of_household: null,
  household_size: 4,
  hh_equiv_adults: null,
  hh_children_0_14: null,
  hh_female_over_14: null,
  hh_male_15_59: null,
  hh_male_over_59: null,
  old_stove_type: null,
  primary_fuel_type: null,
  photo_old_stove_url: null,
  new_stove_type: null,
  stove_serial_number: null,
  enrolment_date: "2026-01-15",
  sync_status: "synced",
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-01-15T00:00:00Z",
  community: null,
};

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
});

describe("CreateHouseholdDialog", () => {
  it("shows validation errors when required fields are missing", async () => {
    render(
      <CreateHouseholdDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.click(screen.getByRole("button", { name: /enrol household/i }));

    expect(await screen.findByText(/household size is required/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("doesn't ask for a household code, since the backend generates it", () => {
    render(
      <CreateHouseholdDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    expect(screen.queryByLabelText(/household code/i)).not.toBeInTheDocument();
  });

  it("submits with numeric fields converted and empty optional fields omitted", async () => {
    mockCreateMutateAsync.mockResolvedValue(household);
    render(
      <CreateHouseholdDialog open onOpenChange={jest.fn()} projectId="p1" />
    );

    fireEvent.change(screen.getByLabelText(/community/i), {
      target: { value: "Ojo" },
    });
    fireEvent.change(screen.getByLabelText(/household size/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/enrolment date/i), {
      target: { value: "2026-01-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enrol household/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          community: "Ojo",
          household_size: 4,
          enrolment_date: "2026-01-15",
          hh_children_0_14: undefined,
          gps_latitude: undefined,
        })
      );
    });
    const [submittedPayload] = mockCreateMutateAsync.mock.calls[0];
    expect(submittedPayload).not.toHaveProperty("household_code");
    expect(await screen.findByText(/was enrolled/i)).toBeInTheDocument();
  });
});
