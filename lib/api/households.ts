import { apiClient } from "@/lib/api/client";
import type { Household, HouseholdInput, HouseholdUpdateInput } from "@/lib/types/household";
import type { PagedResponse } from "@/lib/types/pagination";

const MAX_PAGE_SIZE = 100;

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

export async function listHouseholds(
  projectId: string,
  organisationId?: string
): Promise<Household[]> {
  const res = await apiClient.get<PagedResponse<Household>>(
    `/projects/${projectId}/households`,
    { params: { size: MAX_PAGE_SIZE }, headers: orgHeader(organisationId) }
  );
  return res.data.data;
}

export async function getHousehold(id: string, organisationId?: string): Promise<Household> {
  const res = await apiClient.get<Household>(`/households/${id}`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function createHousehold(
  projectId: string,
  data: HouseholdInput,
  organisationId?: string
): Promise<Household> {
  const res = await apiClient.post<Household>(`/projects/${projectId}/households`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function updateHousehold(
  id: string,
  data: HouseholdUpdateInput,
  organisationId?: string
): Promise<Household> {
  const res = await apiClient.patch<Household>(`/households/${id}`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function deleteHousehold(id: string, organisationId?: string): Promise<void> {
  await apiClient.delete(`/households/${id}`, {
    headers: orgHeader(organisationId),
  });
}
