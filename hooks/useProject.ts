import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listProjectMembers,
  assignProjectMember,
  removeProjectMember,
} from "@/lib/api/projects";
import type { ProjectInput, ProjectUpdateInput } from "@/lib/types/project";

export function useProject(id: string, organisationId?: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id, organisationId),
    enabled: !!id,
  });
}

export function useCreateProject(organisationId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const targetOrganisationId = organisationId ?? session?.activeOrganisationId;

  return useMutation({
    mutationFn: (data: ProjectInput) => {
      if (!targetOrganisationId) throw new Error("No active organisation selected");
      return createProject(data, targetOrganisationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", targetOrganisationId] });
    },
  });
}

export function useUpdateProject(id: string, organisationId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const targetOrganisationId = organisationId ?? session?.activeOrganisationId;

  return useMutation({
    mutationFn: (data: ProjectUpdateInput) => updateProject(id, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects", targetOrganisationId] });
    },
  });
}

export function useDeleteProject(id: string, organisationId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const targetOrganisationId = organisationId ?? session?.activeOrganisationId;

  return useMutation({
    mutationFn: () => deleteProject(id, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", targetOrganisationId] });
    },
  });
}

export function useProjectMembers(projectId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => listProjectMembers(projectId, organisationId),
    enabled: !!projectId,
  });
}

export function useAssignProjectMember(projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => assignProjectMember(projectId, userId, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
    },
  });
}

export function useRemoveProjectMember(projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId, userId, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
    },
  });
}
