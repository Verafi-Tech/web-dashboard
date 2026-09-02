import { render, screen, waitFor } from "@testing-library/react";
import { ReportDetailClient } from "@/components/reports/ReportDetailClient";
import type { Report } from "@/lib/types/report";

const mockUseSession = jest.fn();
const mockUseReport = jest.fn();
const mockUseProject = jest.fn();
const mockGetReportHtml = jest.fn();
const mockDownloadReportPdf = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

jest.mock("@/hooks/useReport", () => ({
  useReport: () => mockUseReport(),
  useApproveReport: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/useProject", () => ({
  useProject: () => mockUseProject(),
}));

jest.mock("@/lib/api/reports", () => ({
  getReportHtml: (...args: unknown[]) => mockGetReportHtml(...args),
  downloadReportPdf: (...args: unknown[]) => mockDownloadReportPdf(...args),
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
  approval_logs: [
    {
      id: "log1",
      from_status: "DRAFT",
      to_status: "VERIFIED",
      vvb_name: "DNV GL",
      vvb_comments: "All good",
      changed_at: "2026-07-03T00:00:00Z",
    },
  ],
};

beforeEach(() => {
  mockGetReportHtml.mockReset();
  mockDownloadReportPdf.mockReset();
  mockGetReportHtml.mockResolvedValue("<html><body>Report</body></html>");
  mockUseProject.mockReturnValue({ data: { organisation_id: "org-1" } });
});

describe("ReportDetailClient", () => {
  it("renders the summary stats and approval history for an admin", async () => {
    mockUseSession.mockReturnValue({
      data: { organisations: [{ id: "org-1", name: "Org", role: "admin" }] },
    });
    mockUseReport.mockReturnValue({ data: report, isLoading: false, isError: false });

    render(<ReportDetailClient reportId="r1" projectId="p1" />);

    expect(screen.getByText("230.6")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("DNV GL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record vvb decision/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetReportHtml).toHaveBeenCalledWith("r1", undefined);
    });
  });

  it("hides the approve action for a non-admin viewer", () => {
    mockUseSession.mockReturnValue({
      data: { organisations: [{ id: "org-1", name: "Org", role: "field_agent" }] },
    });
    mockUseReport.mockReturnValue({ data: report, isLoading: false, isError: false });

    render(<ReportDetailClient reportId="r1" projectId="p1" />);

    expect(
      screen.queryByRole("button", { name: /record vvb decision/i })
    ).not.toBeInTheDocument();
  });

  it("hides the approve action once a report is no longer in DRAFT", () => {
    mockUseSession.mockReturnValue({
      data: { organisations: [{ id: "org-1", name: "Org", role: "admin" }] },
    });
    mockUseReport.mockReturnValue({
      data: { ...report, status: "VERIFIED" },
      isLoading: false,
      isError: false,
    });

    render(<ReportDetailClient reportId="r1" projectId="p1" />);

    expect(
      screen.queryByRole("button", { name: /record vvb decision/i })
    ).not.toBeInTheDocument();
  });

  it("shows a failed-to-load state", () => {
    mockUseSession.mockReturnValue({ data: { organisations: [] } });
    mockUseReport.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("not found"),
    });

    render(<ReportDetailClient reportId="r1" projectId="p1" />);

    expect(screen.getByText(/failed to load report/i)).toBeInTheDocument();
  });
});
