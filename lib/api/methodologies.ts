import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import type {
  Methodology,
  SurveyTemplate,
  SurveyTemplateInput,
} from "@/lib/types/methodology";

export async function listMethodologies(): Promise<Methodology[]> {
  const res = await apiClient.get<Methodology[]>("/methodologies");
  return res.data;
}

export async function getSurveyTemplate(
  methodologyId: string
): Promise<SurveyTemplate | null> {
  try {
    const res = await apiClient.get<SurveyTemplate>(
      `/methodologies/${methodologyId}/survey-template`
    );
    return res.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createSurveyTemplate(
  methodologyId: string,
  data: SurveyTemplateInput
): Promise<SurveyTemplate> {
  const res = await apiClient.post<SurveyTemplate>(
    `/methodologies/${methodologyId}/survey-template`,
    data
  );
  return res.data;
}

export async function updateSurveyTemplate(
  methodologyId: string,
  data: SurveyTemplateInput
): Promise<SurveyTemplate> {
  const res = await apiClient.patch<SurveyTemplate>(
    `/methodologies/${methodologyId}/survey-template`,
    data
  );
  return res.data;
}

export async function deleteSurveyTemplate(methodologyId: string): Promise<void> {
  await apiClient.delete(`/methodologies/${methodologyId}/survey-template`);
}
