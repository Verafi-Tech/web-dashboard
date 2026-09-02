import { render, screen } from "@testing-library/react";
import { CalculationsTab } from "@/components/calculations/CalculationsTab";
import type { CalculationSummary } from "@/lib/types/calculation";

const mockUseCalculations = jest.fn();

jest.mock("@/hooks/useCalculation", () => ({
  useCalculations: () => mockUseCalculations(),
  useCreateCalculation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/useHouseholds", () => ({
  useHouseholds: () => ({ data: [], isLoading: false }),
}));

const calculation: CalculationSummary = {
  calculation_id: "c1",
  year: 2026,
  status: "COMPLETED",
  net_emission_reductions: "12.5",
  baseline_emissions: "20.0",
  project_emissions: "5.0",
  created_at: "2026-03-01T00:00:00Z",
};

describe("CalculationsTab", () => {
  it("shows an empty state and no run button for a non-managing viewer", () => {
    mockUseCalculations.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<CalculationsTab projectId="p1" canManage={false} />);

    expect(screen.getByText(/no calculations yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /run calculation/i })).not.toBeInTheDocument();
  });

  it("shows the run button for a managing viewer", () => {
    mockUseCalculations.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<CalculationsTab projectId="p1" canManage />);

    expect(screen.getByRole("button", { name: /run calculation/i })).toBeInTheDocument();
  });

  it("renders a table row for each calculation", () => {
    mockUseCalculations.mockReturnValue({ data: [calculation], isLoading: false, isError: false });
    render(<CalculationsTab projectId="p1" canManage={false} />);

    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("12.5")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("shows an error state when the list fails to load", () => {
    mockUseCalculations.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("network down"),
    });
    render(<CalculationsTab projectId="p1" canManage={false} />);

    expect(screen.getByText(/failed to load calculations/i)).toBeInTheDocument();
  });
});
