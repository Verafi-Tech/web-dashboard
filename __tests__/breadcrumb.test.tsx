import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Breadcrumb", () => {
  it("renders one crumb for the dashboard root", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Breadcrumb />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders a crumb per segment, with the last one non-clickable", () => {
    mockUsePathname.mockReturnValue("/dashboard/methodologies");
    render(<Breadcrumb />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Methodologies" })).not.toBeInTheDocument();
    expect(screen.getByText("Methodologies")).toBeInTheDocument();
  });

  it("truncates a UUID route param instead of rendering it in full", () => {
    const projectId = "550e8400-e29b-41d4-a716-446655440000";
    mockUsePathname.mockReturnValue(`/dashboard/projects/${projectId}`);
    render(<Breadcrumb />);

    expect(screen.queryByText(projectId)).not.toBeInTheDocument();
    const crumb = screen.getByText("550e8400…");
    expect(crumb).toBeInTheDocument();
    expect(crumb).toHaveAttribute("title", projectId);
  });

  it("truncates both UUIDs on the nested household route", () => {
    const projectId = "550e8400-e29b-41d4-a716-446655440000";
    const householdId = "661f9511-f3ac-52e5-b827-557766551111";
    mockUsePathname.mockReturnValue(
      `/dashboard/projects/${projectId}/households/${householdId}`
    );
    render(<Breadcrumb />);

    expect(screen.getByText("550e8400…")).toBeInTheDocument();
    expect(screen.getByText("661f9511…")).toBeInTheDocument();
    expect(screen.getByText("Households")).toBeInTheDocument();
  });

  it("doesn't link the Households crumb, since it isn't a standalone route", () => {
    const projectId = "550e8400-e29b-41d4-a716-446655440000";
    const householdId = "661f9511-f3ac-52e5-b827-557766551111";
    mockUsePathname.mockReturnValue(
      `/dashboard/projects/${projectId}/households/${householdId}`
    );
    render(<Breadcrumb />);

    expect(screen.queryByRole("link", { name: "Households" })).not.toBeInTheDocument();
    // The project crumb before it is still a real route and stays clickable.
    expect(screen.getByRole("link", { name: "550e8400…" })).toBeInTheDocument();
  });

  it("doesn't link the Calculations crumb, since it isn't a standalone route", () => {
    const projectId = "550e8400-e29b-41d4-a716-446655440000";
    const calculationId = "661f9511-f3ac-52e5-b827-557766551111";
    mockUsePathname.mockReturnValue(
      `/dashboard/projects/${projectId}/calculations/${calculationId}`
    );
    render(<Breadcrumb />);

    expect(screen.queryByRole("link", { name: "Calculations" })).not.toBeInTheDocument();
    expect(screen.getByText("Calculations")).toBeInTheDocument();
  });

  it("doesn't link the Reports crumb, since it isn't a standalone route", () => {
    const projectId = "550e8400-e29b-41d4-a716-446655440000";
    const reportId = "661f9511-f3ac-52e5-b827-557766551111";
    mockUsePathname.mockReturnValue(
      `/dashboard/projects/${projectId}/reports/${reportId}`
    );
    render(<Breadcrumb />);

    expect(screen.queryByRole("link", { name: "Reports" })).not.toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });
});
