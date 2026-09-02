import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectsListClient } from "@/components/projects/ProjectsListClient";

const mockUseSession = jest.fn();
const mockUseProjects = jest.fn();
const mockCreateMutateAsync = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useProjects", () => ({
  useProjects: () => mockUseProjects(),
}));

jest.mock("@/hooks/useProject", () => ({
  useCreateProject: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

jest.mock("@/hooks/useMethodologies", () => ({
  useMethodologies: () => ({ data: [], isLoading: false }),
}));

function mockSession(role: string) {
  mockUseSession.mockReturnValue({
    data: { activeOrganisationId: "org-1", activeOrganisationRole: role },
  });
}

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
});

describe("ProjectsListClient", () => {
  it("shows an admin-flavored empty state and a create button for an admin", () => {
    mockSession("admin");
    mockUseProjects.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<ProjectsListClient />);

    expect(screen.getByText(/create a project to get started/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument();
  });

  it("shows a read-only empty state and no create button for a non-admin", () => {
    mockSession("field_agent");
    mockUseProjects.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<ProjectsListClient />);

    expect(
      screen.getByText(/projects for this organisation will show up here/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new project/i })).not.toBeInTheDocument();
  });

  it("lists projects with a View link", () => {
    mockSession("admin");
    mockUseProjects.mockReturnValue({
      data: [
        {
          id: "p1",
          organisation_id: "org-1",
          name: "Cookstove Adoption — Lagos",
          methodology_id: "m1",
          country: "Nigeria",
          state: null,
          location: null,
          start_date: "2026-01-15",
          status: "active",
          verra_project_id: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
      isLoading: false,
      isError: false,
    });
    render(<ProjectsListClient />);

    expect(screen.getByText("Cookstove Adoption — Lagos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/dashboard/projects/p1"
    );
  });

  it("opens the create project dialog", () => {
    mockSession("admin");
    mockUseProjects.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<ProjectsListClient />);

    fireEvent.click(screen.getByRole("button", { name: /new project/i }));

    expect(screen.getByText(/creates a new project/i)).toBeInTheDocument();
  });
});
