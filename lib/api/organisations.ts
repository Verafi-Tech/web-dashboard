import { apiClient } from "@/lib/api/client";
import type { Organisation, OrganisationInput } from "@/lib/types/organisation";
import type { OrgUser } from "@/lib/types/user";
import type { PagedResponse } from "@/lib/types/pagination";

const MAX_PAGE_SIZE = 100;

export async function getOrganisation(id: string): Promise<Organisation> {
  const res = await apiClient.get<Organisation>(`/organisations/${id}`, {
    headers: { "X-Organisation-ID": id },
  });
  return res.data;
}

// Members-only endpoint (any role), unlike the admin-only GET /users — use
// this for an org's Members tab, not listUsers(), so non-admin viewers of
// an org they belong to don't 403.
export async function getOrganisationMembers(id: string): Promise<OrgUser[]> {
  const res = await apiClient.get<PagedResponse<OrgUser>>(`/organisations/${id}/members`, {
    params: { size: MAX_PAGE_SIZE },
    headers: { "X-Organisation-ID": id },
  });
  return res.data.data;
}

export async function createOrganisation(
  data: OrganisationInput
): Promise<Organisation> {
  const res = await apiClient.post<Organisation>("/organisations", data);
  return res.data;
}

export async function updateOrganisation(
  id: string,
  data: OrganisationInput
): Promise<Organisation> {
  const res = await apiClient.patch<Organisation>(`/organisations/${id}`, data, {
    headers: { "X-Organisation-ID": id },
  });
  return res.data;
}

export async function deleteOrganisation(id: string): Promise<void> {
  await apiClient.delete(`/organisations/${id}`, {
    headers: { "X-Organisation-ID": id },
  });
}
