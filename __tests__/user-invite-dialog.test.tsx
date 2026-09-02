import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserInviteDialog } from "@/components/users/UserInviteDialog";

const mutateAsync = jest.fn();

jest.mock("@/hooks/useUser", () => ({
  useInviteUser: () => ({ mutateAsync, isPending: false }),
}));

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

beforeEach(() => {
  mutateAsync.mockReset();
});

const baseUser = {
  id: "u1",
  email: "new@verafi.com",
  full_name: "New User",
  role: "field_agent" as const,
  organisation_id: "org-1",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("UserInviteDialog", () => {
  it("shows a validation error for an invalid email", async () => {
    render(<UserInviteDialog open onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("shows the temporary password for a newly created user", async () => {
    mutateAsync.mockResolvedValue({
      user: baseUser,
      temporary_password: "tmp_Abc123",
    });
    render(<UserInviteDialog open onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@verafi.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "new@verafi.com",
        role: "field_agent",
      });
    });
    expect(await screen.findByText("tmp_Abc123")).toBeInTheDocument();
  });

  it("does not show a password box when the user already existed", async () => {
    mutateAsync.mockResolvedValue({
      user: baseUser,
      temporary_password: null,
    });
    render(<UserInviteDialog open onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@verafi.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    expect(
      await screen.findByText(/existing password is unchanged/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copy temporary password/i })).not.toBeInTheDocument();
  });

  it("closes the dialog when Done is clicked after a successful invite", async () => {
    mutateAsync.mockResolvedValue({
      user: baseUser,
      temporary_password: "tmp_Abc123",
    });
    const onOpenChange = jest.fn();
    render(<UserInviteDialog open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@verafi.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    fireEvent.click(await screen.findByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
