import { render } from "@testing-library/react";
import { signOut } from "next-auth/react";
import { SessionWatcher } from "@/components/auth/SessionWatcher";

const mockUseSession = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn(),
}));

const signOutMock = signOut as jest.Mock;

beforeEach(() => {
  signOutMock.mockReset();
});

describe("SessionWatcher", () => {
  it("does nothing when the session is healthy", () => {
    mockUseSession.mockReturnValue({ data: { error: undefined } });
    render(<SessionWatcher />);

    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("signs out when a refresh-token failure is present", () => {
    mockUseSession.mockReturnValue({
      data: { error: "RefreshAccessTokenError" },
    });
    render(<SessionWatcher />);

    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: "/login" });
  });
});
