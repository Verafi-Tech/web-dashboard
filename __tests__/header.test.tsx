import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

const mockUseSession = jest.fn();
const mockSetTheme = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn(),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: mockSetTheme }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

beforeEach(() => {
  mockSetTheme.mockReset();
});

describe("Header", () => {
  it("shows the active organisation name linking to /select-organisation", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: "admin@verafi.com" },
        organisations: [{ id: "org-1", name: "Verafi Super Admin", role: "admin" }],
        activeOrganisationId: "org-1",
      },
    });
    render(<Header onMenuClick={jest.fn()} />);

    const orgLink = screen.getByRole("link", { name: "Verafi Super Admin" });
    expect(orgLink).toHaveAttribute("href", "/select-organisation");
  });

  it("calls onMenuClick when the mobile menu button is pressed", () => {
    mockUseSession.mockReturnValue({ data: null });
    const onMenuClick = jest.fn();
    render(<Header onMenuClick={onMenuClick} />);

    fireEvent.click(screen.getByRole("button", { name: /open navigation/i }));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it("toggles theme when the theme button is pressed", () => {
    mockUseSession.mockReturnValue({ data: null });
    render(<Header onMenuClick={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
