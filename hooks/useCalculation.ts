import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCalculation, getCalculation, listCalculations } from "@/lib/api/calculations";
import type { VM0050CalculationRequest } from "@/lib/types/calculation";

export function useCalculations(projectId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["calculations", projectId],
    queryFn: () => listCalculations(projectId, organisationId),
    enabled: !!projectId,
  });
}

export function useCalculation(calculationId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["calculation", calculationId],
    queryFn: () => getCalculation(calculationId, organisationId),
    enabled: !!calculationId,
  });
}

export function useCreateCalculation(projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VM0050CalculationRequest) =>
      createCalculation(projectId, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculations", projectId] });
    },
  });
}
