import { apiClient } from "@/lib/api/client";
import type { Project, ProjectInput, ProjectUpdateInput, ProjectMember } from "@/lib/types/project";
import type { PagedResponse } from "@/lib/types/pagination";

const MAX_PAGE_SIZE = 100;

function orgHeader(organisationId?: string) {
  return organisationId ? { "X-Organisation-ID": organisationId } : undefined;
}

// Confirmed against the live OpenAPI schema (GET /api/v1/projects/):
// paginated {data, meta} like /users, not the bare array the old static
// API reference doc implied.
export async function listProjects(organisationId: string): Promise<Project[]> {
  const res = await apiClient.get<PagedResponse<Project>>("/projects", {
    params: { size: MAX_PAGE_SIZE },
    headers: { "X-Organisation-ID": organisationId },
  });
  return res.data.data;
}

// organisationId is optional here (and below) — omit to act on the caller's
// active org via the apiClient interceptor default; pass it explicitly when
// acting on an org that isn't necessarily the active one (e.g. a project
// reached from a different org's detail page).
export async function getProject(id: string, organisationId?: string): Promise<Project> {
  const res = await apiClient.get<Project>(`/projects/${id}`, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function createProject(
  data: ProjectInput,
  organisationId?: string
): Promise<Project> {
  const res = await apiClient.post<Project>("/projects", data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function updateProject(
  id: string,
  data: ProjectUpdateInput,
  organisationId?: string
): Promise<Project> {
  const res = await apiClient.patch<Project>(`/projects/${id}`, data, {
    headers: orgHeader(organisationId),
  });
  return res.data;
}

export async function deleteProject(id: string, organisationId?: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`, {
    headers: orgHeader(organisationId),
  });
}

export async function listProjectMembers(
  projectId: string,
  organisationId?: string
): Promise<ProjectMember[]> {
  const res = await apiClient.get<PagedResponse<ProjectMember>>(
    `/projects/${projectId}/members`,
    {
      params: { size: MAX_PAGE_SIZE },
      headers: orgHeader(organisationId),
    }
  );
  return res.data.data;
}

// The backend's own schema documents this endpoint as returning a
// ProjectResponse (not a member object) — a doc inconsistency, not
// something to build around. Callers should invalidate the members query
// rather than rely on this resolving to anything in particular.
export async function assignProjectMember(
  projectId: string,
  userId: string,
  organisationId?: string
): Promise<void> {
  await apiClient.post(
    `/projects/${projectId}/members`,
    { user_id: userId },
    { headers: orgHeader(organisationId) }
  );
}

export async function removeProjectMember(
  projectId: string,
  userId: string,
  organisationId?: string
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`, {
    headers: orgHeader(organisationId),
  });
}
