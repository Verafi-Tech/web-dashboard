import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NAV_ITEMS } from "@/components/layout/nav-config";

const mockUsePathname = jest.fn();
const mockUseSession = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

function mockRole(role: string | undefined) {
  mockUseSession.mockReturnValue({
    data: role ? { activeOrganisationRole: role } : null,
  });
}

describe("Sidebar", () => {
  it("renders a link for every nav item when the role is admin", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockRole("admin");
    render(<Sidebar open onNavigate={jest.fn()} />);

    for (const item of NAV_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.href);
    }
  });

  it("hides admin-only sections for a field agent", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockRole("field_agent");
    render(<Sidebar open onNavigate={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Methodologies" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Organisations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Audit Logs" })).not.toBeInTheDocument();
    // Settings is visible to every role now — it hosts self-service user
    // settings, not just the admin-only Storage section.
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("hides admin-only sections for a viewer", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockRole("viewer");
    render(<Sidebar open onNavigate={jest.fn()} />);

    expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
  });

  it("marks only the current section as active", () => {
    mockUsePathname.mockReturnValue("/dashboard/methodologies");
    mockRole("admin");
    render(<Sidebar open onNavigate={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Methodologies" }).className).toMatch(
      /bg-sidebar-primary/
    );
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toMatch(
      /bg-sidebar-primary/
    );
  });

  it("hides off-canvas on mobile when closed", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockRole("admin");
    render(<Sidebar open={false} onNavigate={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Dashboard" }).closest("aside")?.className).toMatch(
      /-translate-x-full/
    );
  });
});
