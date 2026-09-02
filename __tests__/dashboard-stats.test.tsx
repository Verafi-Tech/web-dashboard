import { render, screen } from "@testing-library/react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

const mockUseSession = jest.fn();
const mockUseProjects = jest.fn();
const mockUseUsers = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useProjects", () => ({
  useProjects: () => mockUseProjects(),
}));

jest.mock("@/hooks/useUsers", () => ({
  useUsers: () => mockUseUsers(),
}));

describe("DashboardStats", () => {
  it("computes active project count and total user count for an admin", () => {
    mockUseSession.mockReturnValue({
      data: {
        organisations: [{ id: "org-1", name: "Org", role: "admin" }],
        activeOrganisationId: "org-1",
        activeOrganisationRole: "admin",
      },
    });
    mockUseProjects.mockReturnValue({
      data: [
        { id: "1", status: "active" },
        { id: "2", status: "completed" },
        { id: "3", status: "active" },
      ],
      isLoading: false,
      isError: false,
    });
    mockUseUsers.mockReturnValue({
      data: [
        { id: "u1", role: "admin" },
        { id: "u2", role: "viewer" },
        { id: "u3", role: "admin" },
      ],
      isLoading: false,
      isError: false,
    });

    render(<DashboardStats />);

    // 2 active projects
    expect(screen.getByText("2")).toBeInTheDocument();
    // 1 organisation
    expect(screen.getByText("1")).toBeInTheDocument();
    // 3 total users
    expect(screen.getByText("3")).toBeInTheDocument();
    // Reports generated has no backing endpoint yet — static placeholder
    expect(screen.getByText("Reports generated")).toBeInTheDocument();
  });

  it("hides the total-users stat for a non-admin", () => {
    mockUseSession.mockReturnValue({
      data: {
        organisations: [{ id: "org-1", name: "Org", role: "field_agent" }],
        activeOrganisationId: "org-1",
        activeOrganisationRole: "field_agent",
      },
    });
    mockUseProjects.mockReturnValue({ data: [], isLoading: false, isError: false });
    mockUseUsers.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(<DashboardStats />);

    expect(screen.queryByText("Total users")).not.toBeInTheDocument();
  });

  it("shows a muted dash instead of crashing when a stat query errors", () => {
    mockUseSession.mockReturnValue({ data: { organisations: [] } });
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<DashboardStats />);

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
