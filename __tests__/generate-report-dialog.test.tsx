import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";

const mockGenerateMutateAsync = jest.fn();

jest.mock("@/hooks/useReport", () => ({
  useGenerateReport: () => ({ mutateAsync: mockGenerateMutateAsync, isPending: false }),
}));

beforeEach(() => {
  mockGenerateMutateAsync.mockReset();
});

describe("GenerateReportDialog", () => {
  it("submits with SUMS method and no customer support level required", async () => {
    mockGenerateMutateAsync.mockResolvedValue({});
    render(<GenerateReportDialog open onOpenChange={jest.fn()} projectId="p1" />);

    fireEvent.change(screen.getByLabelText(/period start/i), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/period end/i), {
      target: { value: "2026-06-30" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate report/i }));

    await waitFor(() => {
      expect(mockGenerateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          period_start: "2026-01-01",
          period_end: "2026-06-30",
          usage_rate_method: "SUMS",
          customer_support_level: undefined,
        })
      );
    });
    expect(await screen.findByText(/report was generated/i)).toBeInTheDocument();
  });

  it("requires customer support level for survey-based usage rate", async () => {
    render(<GenerateReportDialog open onOpenChange={jest.fn()} projectId="p1" />);

    fireEvent.change(screen.getByLabelText(/period start/i), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/period end/i), {
      target: { value: "2026-06-30" },
    });
    fireEvent.change(screen.getByLabelText(/usage rate method/i), {
      target: { value: "SURVEYS" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate report/i }));

    expect(
      await screen.findByText(/required for survey-based monitoring/i)
    ).toBeInTheDocument();
    expect(mockGenerateMutateAsync).not.toHaveBeenCalled();
  });
});
