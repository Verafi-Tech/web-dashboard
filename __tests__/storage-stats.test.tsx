import { render, screen } from "@testing-library/react";
import { StorageStats } from "@/components/settings/StorageStats";

const mockUseUploadStats = jest.fn();

jest.mock("@/hooks/useUpload", () => ({
  useUploadStats: () => mockUseUploadStats(),
}));

describe("StorageStats", () => {
  it("shows formatted storage numbers", () => {
    mockUseUploadStats.mockReturnValue({
      data: {
        total_storage_used: 4 * 1024 * 1024,
        storage_quota: 1024 * 1024 * 1024,
        file_count: 3,
        quota_percentage: 0.37,
      },
      isLoading: false,
      isError: false,
    });
    render(<StorageStats />);

    expect(screen.getByText("4.0 MB")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("0.4%")).toBeInTheDocument();
    expect(screen.queryByText(/storage is at/i)).not.toBeInTheDocument();
  });

  it("shows a warning banner when quota usage is above 80%", () => {
    mockUseUploadStats.mockReturnValue({
      data: {
        total_storage_used: 900 * 1024 * 1024,
        storage_quota: 1024 * 1024 * 1024,
        file_count: 50,
        quota_percentage: 87.9,
      },
      isLoading: false,
      isError: false,
    });
    render(<StorageStats />);

    expect(screen.getByText(/storage is at 87.9%/i)).toBeInTheDocument();
  });

  it("shows an error state when the stats query fails", () => {
    mockUseUploadStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    });
    render(<StorageStats />);

    expect(screen.getByText(/failed to load storage stats/i)).toBeInTheDocument();
  });
});
