import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

const mockCreateMutateAsync = jest.fn();

jest.mock("@/hooks/useProject", () => ({
  useCreateProject: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

jest.mock("@/hooks/useMethodologies", () => ({
  useMethodologies: () => ({
    data: [
      {
        id: "m1",
        code: "VM0050",
        version: "1.0",
        name: "Improved Cookstoves",
        standard: "Verra",
        parameters: {},
      },
    ],
    isLoading: false,
  }),
}));

beforeEach(() => {
  mockCreateMutateAsync.mockReset();
});

const project = {
  id: "p1",
  organisation_id: "org-1",
  name: "New Project",
  methodology_id: "m1",
  country: "Nigeria",
  state: null,
  location: null,
  start_date: "2026-01-15",
  status: "active" as const,
  verra_project_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("CreateProjectDialog", () => {
  it("shows a validation error when required fields are missing", async () => {
    render(<CreateProjectDialog open onOpenChange={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("submits the form with the selected methodology code", async () => {
    mockCreateMutateAsync.mockResolvedValue(project);
    render(<CreateProjectDialog open onOpenChange={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "New Project" },
    });
    fireEvent.change(screen.getByLabelText(/methodology/i), {
      target: { value: "VM0050" },
    });
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-01-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Project",
          methodology_code: "VM0050",
          country: "Nigeria",
          start_date: "2026-01-15",
        })
      );
    });
    expect(await screen.findByText(/was created/i)).toBeInTheDocument();
  });
});
