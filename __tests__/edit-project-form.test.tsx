import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditProjectForm } from "@/components/projects/EditProjectForm";
import type { Project } from "@/lib/types/project";

const pushMock = jest.fn();
const updateMutateAsync = jest.fn();
const deleteMutateAsync = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/hooks/useProject", () => ({
  useUpdateProject: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
  useDeleteProject: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
}));

const project: Project = {
  id: "p1",
  organisation_id: "org-1",
  name: "Cookstove Adoption — Lagos",
  methodology_id: "m1",
  country: "Nigeria",
  state: "Lagos",
  location: null,
  start_date: "2026-01-15",
  status: "active",
  verra_project_id: null,
  description: null,
  location_description: null,
  scale_category: null,
  crediting_period_start: null,
  crediting_period_end: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  pushMock.mockReset();
  updateMutateAsync.mockReset();
  deleteMutateAsync.mockReset();
});

describe("EditProjectForm", () => {
  it("pre-fills the form with the current project data", () => {
    render(<EditProjectForm project={project} />);

    expect(screen.getByDisplayValue("Cookstove Adoption — Lagos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nigeria")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lagos")).toBeInTheDocument();
  });

  it("shows a validation error when the name is cleared", async () => {
    render(<EditProjectForm project={project} />);

    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits updated fields", async () => {
    updateMutateAsync.mockResolvedValue(project);
    render(<EditProjectForm project={project} />);

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Updated Project Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Updated Project Name" })
      );
    });
  });

  it("confirms before deleting and redirects on success", async () => {
    deleteMutateAsync.mockResolvedValue(undefined);
    render(<EditProjectForm project={project} />);

    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/projects"));
  });
});
