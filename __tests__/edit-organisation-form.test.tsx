import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditOrganisationForm } from "@/components/organisations/EditOrganisationForm";
import type { Organisation } from "@/lib/types/organisation";

const pushMock = jest.fn();
const updateMutateAsync = jest.fn();
const deleteMutateAsync = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks/useOrganisation", () => ({
  useUpdateOrganisation: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
  useDeleteOrganisation: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
}));

const organisation: Organisation = {
  id: "org-1",
  name: "Verafi Super Admin",
  description: "Original description",
  country: "Nigeria",
  code: "VERAFI-01",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  pushMock.mockReset();
  updateMutateAsync.mockReset();
  deleteMutateAsync.mockReset();
});

describe("EditOrganisationForm", () => {
  it("pre-fills the form with the current organisation data", () => {
    render(<EditOrganisationForm organisation={organisation} />);

    expect(screen.getByDisplayValue("Verafi Super Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original description")).toBeInTheDocument();
  });

  it("shows a validation error when the name is cleared", async () => {
    render(<EditOrganisationForm organisation={organisation} />);

    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits updated fields", async () => {
    updateMutateAsync.mockResolvedValue(organisation);
    render(<EditOrganisationForm organisation={organisation} />);

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Updated Org Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Updated Org Name" })
      );
    });
  });

  it("confirms before deleting and redirects on success", async () => {
    deleteMutateAsync.mockResolvedValue(undefined);
    render(<EditOrganisationForm organisation={organisation} />);

    fireEvent.click(screen.getByRole("button", { name: /delete organisation/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalled());
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/dashboard/organisations")
    );
  });
});
