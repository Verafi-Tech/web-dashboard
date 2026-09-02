import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateReport, getReport, listReports, approveReport } from "@/lib/api/reports";
import type { ReportGenerationInput, ReportApprovalInput } from "@/lib/types/report";

export function useReports(projectId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => listReports(projectId, organisationId),
    enabled: !!projectId,
  });
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
