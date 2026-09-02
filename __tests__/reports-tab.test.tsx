import { render, screen } from "@testing-library/react";
import { ReportsTab } from "@/components/reports/ReportsTab";
import type { Report } from "@/lib/types/report";

const mockUseReports = jest.fn();

jest.mock("@/hooks/useReport", () => ({
  useReports: () => mockUseReports(),
  useGenerateReport: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

const report: Report = {
  id: "r1",
  project_id: "p1",
  organisation_id: "org-1",
  created_by_user_id: "u1",
  period_start: "2026-01-01",
  period_end: "2026-06-30",
  usage_rate_method: "SURVEYS",
  customer_support_level: "FULL",
  usage_rate: "0.8690",
  tco2e_reduced: "230.60",
  status: "DRAFT",
  version: "v1.0",
  created_at: "2026-07-02T14:33:07Z",
  updated_at: "2026-07-02T14:33:07Z",
  sections_count: 5,
  parameters_count: 12,
  approval_logs: [],
};

describe("ReportsTab", () => {
  it("shows an empty state and no generate button for a non-managing viewer", () => {
    mockUseReports.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<ReportsTab projectId="p1" canManage={false} />);

    expect(screen.getByText(/no reports yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate report/i })).not.toBeInTheDocument();
  });

  it("shows the generate button for a managing viewer", () => {
    mockUseReports.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<ReportsTab projectId="p1" canManage />);

    expect(screen.getByRole("button", { name: /generate report/i })).toBeInTheDocument();
  });

  it("renders a table row for each report", () => {
    mockUseReports.mockReturnValue({ data: [report], isLoading: false, isError: false });
    render(<ReportsTab projectId="p1" canManage={false} />);

    expect(screen.getByText("230.6")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("shows an error state when the list fails to load", () => {
    mockUseReports.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("network down"),
    });
    render(<ReportsTab projectId="p1" canManage={false} />);

    expect(screen.getByText(/failed to load reports/i)).toBeInTheDocument();
  });
});
