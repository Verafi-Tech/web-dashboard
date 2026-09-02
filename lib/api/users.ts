import { apiClient } from "@/lib/api/client";
import type {
  OrgUser,
  UpdateUserInput,
  InviteUserInput,
  InviteUserResult,
} from "@/lib/types/user";
import type { PagedResponse } from "@/lib/types/pagination";

// GET /users paginates (page/size, default size 20) and returns
// { data, meta }, not a bare array — fetch the max page size since the UI
// paginates client-side rather than paging through the API.
const MAX_PAGE_SIZE = 100;

export async function listUsers(organisationId?: string): Promise<OrgUser[]> {
  const res = await apiClient.get<PagedResponse<OrgUser>>("/users", {
    params: { size: MAX_PAGE_SIZE },
    headers: organisationId ? { "X-Organisation-ID": organisationId } : undefined,
  });
  return res.data.data;
}

export async function getUser(userId: string): Promise<OrgUser> {
  const res = await apiClient.get<OrgUser>(`/users/${userId}`);
  return res.data;
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<OrgUser> {
  const res = await apiClient.patch<OrgUser>(`/users/${userId}`, data);
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}

export async function inviteUser(
  organisationId: string,
  data: InviteUserInput
): Promise<InviteUserResult> {
  const res = await apiClient.post<InviteUserResult>(
    `/organisations/${organisationId}/invite`,
    data,
    { headers: { "X-Organisation-ID": organisationId } }
  );
  return res.data;
}
