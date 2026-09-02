import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditHouseholdForm } from "@/components/households/EditHouseholdForm";
import type { Household } from "@/lib/types/household";

const pushMock = jest.fn();
const updateMutateAsync = jest.fn();
const deleteMutateAsync = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks/useHousehold", () => ({
  useUpdateHousehold: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
  useDeleteHousehold: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
}));

jest.mock("@/hooks/useUpload", () => ({
  useUploadFile: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDownloadUrl: () => ({ data: undefined, isLoading: false }),
}));

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

beforeEach(() => {
  pushMock.mockReset();
  updateMutateAsync.mockReset();
  deleteMutateAsync.mockReset();
});

describe("EditHouseholdForm", () => {
  it("pre-fills the form with the current household data", () => {
    render(<EditHouseholdForm household={household} projectId="p1" />);

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("three-stone")).toBeInTheDocument();
  });

  it("submits updated fields", async () => {
    updateMutateAsync.mockResolvedValue(household);
    render(<EditHouseholdForm household={household} projectId="p1" />);

    fireEvent.change(screen.getByLabelText(/head of household/i), {
      target: { value: "John Smith" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ head_of_household: "John Smith" })
      );
    });
  });

  it("confirms before deleting and redirects to the project on success", async () => {
    deleteMutateAsync.mockResolvedValue(undefined);
    render(<EditHouseholdForm household={household} projectId="p1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete household/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/projects/p1"));
  });
});
