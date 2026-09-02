import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PurgeRecordsButton } from "@/components/settings/PurgeRecordsButton";

const mockMutateAsync = jest.fn();

jest.mock("@/hooks/useRetentionPolicy", () => ({
  usePurgeExpiredRecords: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

beforeEach(() => {
  mockMutateAsync.mockReset();
});

describe("PurgeRecordsButton", () => {
  it("opens a confirmation dialog before purging", () => {
    render(<PurgeRecordsButton />);

    fireEvent.click(screen.getByRole("button", { name: /purge expired records/i }));

    expect(screen.getByText(/this permanently deletes or anonymizes/i)).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls the purge mutation and shows the result on confirm", async () => {
    mockMutateAsync.mockResolvedValue({ purged_count: 12 });
    render(<PurgeRecordsButton />);

    fireEvent.click(screen.getByRole("button", { name: /purge expired records/i }));
    fireEvent.click(screen.getByRole("button", { name: "Purge" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    expect(await screen.findByText(/purge complete/i)).toBeInTheDocument();
    expect(screen.getByText(/12 record\(s\) removed/i)).toBeInTheDocument();
  });

  it("shows an error message if the purge fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("boom"));
    render(<PurgeRecordsButton />);

    fireEvent.click(screen.getByRole("button", { name: /purge expired records/i }));
    fireEvent.click(screen.getByRole("button", { name: "Purge" }));

    expect(await screen.findByText("boom")).toBeInTheDocument();
  });
});
