import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { LoginForm } from "@/components/auth/LoginForm";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const signInMock = signIn as jest.Mock;

beforeEach(() => {
  signInMock.mockReset();
  pushMock.mockReset();
  refreshMock.mockReset();
});

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("LoginForm", () => {
  it("shows validation errors instead of calling signIn when fields are empty", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("calls signIn with credentials and redirects to /dashboard on success", async () => {
    signInMock.mockResolvedValue({ error: undefined });
    render(<LoginForm />);

    fillAndSubmit("admin@verafi.com", "s3cret");

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: "admin@verafi.com",
        password: "s3cret",
        redirect: false,
      });
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error message when signIn fails", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin" });
    render(<LoginForm />);

    fillAndSubmit("admin@verafi.com", "wrong");

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
