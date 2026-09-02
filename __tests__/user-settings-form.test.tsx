import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserSettingsForm } from "@/components/settings/UserSettingsForm";

const mockUseSession = jest.fn();
const mockUseUser = jest.fn();
const updateMutateAsync = jest.fn();
const resetMutateAsync = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useUser", () => ({
  useUser: () => mockUseUser(),
  useUpdateUser: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useRequestPasswordReset: () => ({ mutateAsync: resetMutateAsync, isPending: false }),
}));

const user = {
  id: "u1",
  email: "field@verafi.com",
  full_name: "Field Agent",
  role: "field_agent" as const,
  organisation_id: "org-1",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  updateMutateAsync.mockReset();
  resetMutateAsync.mockReset();
  mockUseSession.mockReturnValue({ data: { user: { id: "u1" } } });
});

describe("UserSettingsForm", () => {
  it("pre-fills name and shows the read-only email", () => {
    mockUseUser.mockReturnValue({ data: user, isLoading: false, isError: false });
    render(<UserSettingsForm />);

    expect(screen.getByDisplayValue("Field Agent")).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.value).toBe("field@verafi.com");
    expect(emailInput).toBeDisabled();
  });

  it("submits the updated name", async () => {
    mockUseUser.mockReturnValue({ data: user, isLoading: false, isError: false });
    updateMutateAsync.mockResolvedValue(user);
    render(<UserSettingsForm />);

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "New Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({ full_name: "New Name" });
    });
  });

  it("requests a password reset and shows a generic confirmation, not the token", async () => {
    mockUseUser.mockReturnValue({ data: user, isLoading: false, isError: false });
    resetMutateAsync.mockResolvedValue(undefined);
    render(<UserSettingsForm />);

    fireEvent.click(screen.getByRole("button", { name: /send password reset email/i }));

    await waitFor(() => expect(resetMutateAsync).toHaveBeenCalledWith("field@verafi.com"));
    expect(await screen.findByText(/reset link has been sent/i)).toBeInTheDocument();
  });

  it("shows an error state when the profile fails to load", () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: null });
    render(<UserSettingsForm />);

    expect(screen.getByText(/failed to load your profile/i)).toBeInTheDocument();
  });
});
