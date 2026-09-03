import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateReport, getReport, listReports, approveReport } from "@/lib/api/reports";
import type { ReportGenerationInput, ReportApprovalInput } from "@/lib/types/report";

export function useReports(projectId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => listReports(projectId, organisationId),
    enabled: !!projectId,
  });
}

// There's no org-wide reports endpoint — GET /projects/{id}/reports is the
// only listing available, so a total count means one call per project. Uses
// the same ["reports", projectId] query key as useReports, so this shares
// cache entries with any project's Reports tab a user has already opened.
export function useReportsCount(projectIds: string[], organisationId?: string) {
  const results = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["reports", projectId],
      queryFn: () => listReports(projectId, organisationId),
    })),
  });

  return {
    count: results.reduce((sum, r) => sum + (r.data?.length ?? 0), 0),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
}

export function useReport(reportId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(reportId, organisationId),
    enabled: !!reportId,
  });
}

export function useGenerateReport(projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportGenerationInput) => generateReport(projectId, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
    },
  });
}

export function useApproveReport(
  reportId: string,
  projectId: string,
  organisationId?: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportApprovalInput) => approveReport(reportId, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["reports", projectId] });
    },
  });
}
