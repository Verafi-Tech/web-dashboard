import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadsList } from "@/components/uploads/UploadsList";
import type { Upload } from "@/lib/types/upload";

const mockUseUploads = jest.fn();
const mockDeleteMutateAsync = jest.fn();

jest.mock("@/hooks/useUpload", () => ({
  useUploads: () => mockUseUploads(),
  useDeleteUpload: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
}));

const upload: Upload = {
  id: "u1",
  filename: "stored-name.jpg",
  original_filename: "stove-photo.jpg",
  file_size: 2 * 1024 * 1024,
  mime_type: "image/jpeg",
  status: "confirmed",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  project_id: "p1",
  uploaded_by: { id: "u2", full_name: "Field Agent", email: "field@verafi.com" },
};

beforeEach(() => {
  mockDeleteMutateAsync.mockReset();
});

describe("UploadsList", () => {
  it("shows an empty state when there are no uploads", () => {
    mockUseUploads.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<UploadsList />);

    expect(screen.getByText(/no files uploaded yet/i)).toBeInTheDocument();
  });

  it("lists uploads with formatted size and uploader name", () => {
    mockUseUploads.mockReturnValue({ data: [upload], isLoading: false, isError: false });
    render(<UploadsList />);

    expect(screen.getByText("stove-photo.jpg")).toBeInTheDocument();
    expect(screen.getByText("2.0 MB")).toBeInTheDocument();
    expect(screen.getByText("Field Agent")).toBeInTheDocument();
    expect(screen.getByText("field@verafi.com")).toBeInTheDocument();
  });

  it("shows a dash when the uploader is unknown", () => {
    mockUseUploads.mockReturnValue({
      data: [{ ...upload, uploaded_by: null }],
      isLoading: false,
      isError: false,
    });
    render(<UploadsList />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("hides the delete action when canManage is false", () => {
    mockUseUploads.mockReturnValue({ data: [upload], isLoading: false, isError: false });
    render(<UploadsList canManage={false} />);

    expect(
      screen.queryByRole("button", { name: /delete stove-photo.jpg/i })
    ).not.toBeInTheDocument();
  });

  it("confirms before deleting a file", async () => {
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    mockUseUploads.mockReturnValue({ data: [upload], isLoading: false, isError: false });
    render(<UploadsList />);

    fireEvent.click(screen.getByRole("button", { name: /delete stove-photo.jpg/i }));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(mockDeleteMutateAsync).toHaveBeenCalledWith("u1"));
  });
});
