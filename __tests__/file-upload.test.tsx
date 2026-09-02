import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUpload } from "@/components/common/FileUpload";
import type { Upload } from "@/lib/types/upload";

const mockMutateAsync = jest.fn();
const mockUseDownloadUrl = jest.fn();

jest.mock("@/hooks/useUpload", () => ({
  useUploadFile: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useDownloadUrl: () => mockUseDownloadUrl(),
}));

const confirmedUpload: Upload = {
  id: "u1",
  filename: "stored.jpg",
  original_filename: "photo.jpg",
  file_size: 1024,
  mime_type: "image/jpeg",
  status: "confirmed",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  project_id: null,
  uploaded_by: null,
};

function pickFile(container: HTMLElement, file: File) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockUseDownloadUrl.mockReturnValue({ data: undefined, isLoading: false });
});

describe("FileUpload", () => {
  it("shows an empty drop-zone with the given label when there's no photo", () => {
    render(<FileUpload label="Upload photo" onUploaded={jest.fn()} />);

    expect(screen.getByText("Upload photo")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uploads a picked file, previews it locally, and reports the confirmed upload", async () => {
    mockMutateAsync.mockResolvedValue(confirmedUpload);
    const onUploaded = jest.fn();
    const { container } = render(<FileUpload onUploaded={onUploaded} />);

    const file = new File(["hello"], "photo.jpg", { type: "image/jpeg" });
    pickFile(container, file);

    // The local object-URL preview shows immediately, before the upload
    // even resolves — jest.setup.ts stubs URL.createObjectURL for jsdom.
    expect(await screen.findByRole("img")).toHaveAttribute("src", "blob:mock-url");
    expect(screen.getByText(/change photo/i)).toBeInTheDocument();

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(file));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(confirmedUpload));
  });

  it("shows a previously-uploaded photo via its resolved download URL", () => {
    mockUseDownloadUrl.mockReturnValue({
      data: { download_url: "https://storage.example/existing.jpg", expires_in: 3600, filename: "existing.jpg" },
      isLoading: false,
    });
    render(<FileUpload existingUploadId="u-existing" onUploaded={jest.fn()} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://storage.example/existing.jpg"
    );
  });

  it("shows the specific failure reason and does not call onUploaded when the upload fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Uploading to storage failed: Network Error"));
    const onUploaded = jest.fn();
    const { container } = render(<FileUpload onUploaded={onUploaded} />);

    const file = new File(["hello"], "photo.jpg", { type: "image/jpeg" });
    pickFile(container, file);

    expect(await screen.findByText(/uploading to storage failed/i)).toBeInTheDocument();
    expect(onUploaded).not.toHaveBeenCalled();
    // The failed preview is cleared, back to the empty drop-zone.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
