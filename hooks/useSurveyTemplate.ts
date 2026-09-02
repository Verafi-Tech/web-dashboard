import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSurveyTemplate,
  createSurveyTemplate,
  updateSurveyTemplate,
  deleteSurveyTemplate,
} from "@/lib/api/methodologies";
import type { SurveyTemplateInput } from "@/lib/types/methodology";

export function useSurveyTemplate(methodologyId: string) {
  return useQuery({
    queryKey: ["survey-template", methodologyId],
    queryFn: () => getSurveyTemplate(methodologyId),
  });
}

export function useSaveSurveyTemplate(methodologyId: string, exists: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SurveyTemplateInput) =>
      exists
        ? updateSurveyTemplate(methodologyId, data)
        : createSurveyTemplate(methodologyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["survey-template", methodologyId],
      });
    },
  });
}

export function useDeleteSurveyTemplate(methodologyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSurveyTemplate(methodologyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["survey-template", methodologyId],
      });
    },
  });
}
