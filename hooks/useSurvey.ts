import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSurvey, updateSurvey, deleteSurvey } from "@/lib/api/surveys";
import type { SurveyInput, SurveyUpdateInput } from "@/lib/types/survey";

export function useCreateSurvey(householdId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SurveyInput) => createSurvey(householdId, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys", householdId] });
    },
  });
}

export function useUpdateSurvey(id: string, householdId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SurveyUpdateInput) => updateSurvey(id, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys", householdId] });
    },
  });
}

export function useDeleteSurvey(id: string, householdId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSurvey(id, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys", householdId] });
    },
  });
}
