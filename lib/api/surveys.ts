import { apiClient } from "@/lib/api/client";
import type { Survey, SurveyInput, SurveyUpdateInput } from "@/lib/types/survey";
import type { PagedResponse } from "@/lib/types/pagination";

const MAX_PAGE_SIZE = 100;

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function listSurveys(
  householdId: string,
  organisationId?: string
): Promise<Survey[]> {
  const res = await apiClient.get<PagedResponse<Survey>>(
    `/households/${householdId}/surveys`,
    { params: { size: MAX_PAGE_SIZE }, headers: orgHeader(organisationId) }
  );
  return res.data.data;
}

export async function getSurvey(id: string, organisationId?: string): Promise<Survey> {
  const res = await apiClient.get<Survey>(`/surveys/${id}`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function createSurvey(
  householdId: string,
  data: SurveyInput,
  organisationId?: string
): Promise<Survey> {
  const res = await apiClient.post<Survey>(`/households/${householdId}/surveys`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function updateSurvey(
  id: string,
  data: SurveyUpdateInput,
  organisationId?: string
): Promise<Survey> {
  const res = await apiClient.patch<Survey>(`/surveys/${id}`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function deleteSurvey(id: string, organisationId?: string): Promise<void> {
  await apiClient.delete(`/surveys/${id}`, {
    headers: orgHeader(organisationId),
  });
}
