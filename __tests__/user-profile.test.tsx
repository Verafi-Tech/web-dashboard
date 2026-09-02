import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserProfileClient } from "@/components/users/UserProfileClient";
import type { OrgUser } from "@/lib/types/user";

const pushMock = jest.fn();
const mockUseUser = jest.fn();
const updateMutateAsync = jest.fn();
const deleteMutateAsync = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks/useUser", () => ({
  useUser: () => mockUseUser(),
  useUpdateUser: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
  useDeleteUser: () => ({ mutateAsync: deleteMutateAsync, isPending: false }),
}));

const user: OrgUser = {
  id: "u1",
  email: "field@verafi.com",
  full_name: "Field Agent",
  role: "field_agent",
  organisation_id: "org-1",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  pushMock.mockReset();
  updateMutateAsync.mockReset();
  deleteMutateAsync.mockReset();
});

describe("UserProfileClient", () => {
  it("shows an error state when the user fails to load", () => {
    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("boom"),
    });
    render(<UserProfileClient userId="u1" />);

    expect(screen.getByText(/failed to load user/i)).toBeInTheDocument();
  });

  it("pre-fills the role select with the current user's role", () => {
    mockUseUser.mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<UserProfileClient userId="u1" />);

    expect(screen.getByDisplayValue("Field agent")).toBeInTheDocument();
  });

  it("submits the updated role", async () => {
    mockUseUser.mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
      error: null,
    });
    updateMutateAsync.mockResolvedValue(user);
    render(<UserProfileClient userId="u1" />);

    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: "admin" })
      );
    });
  });

  it("confirms before deleting and redirects on success", async () => {
    mockUseUser.mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
      error: null,
    });
    deleteMutateAsync.mockResolvedValue(undefined);
    render(<UserProfileClient userId="u1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete user/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/users"));
  });
});
