import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganisation,
  getOrganisationMembers,
  createOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from "@/lib/api/organisations";
import type { OrganisationInput } from "@/lib/types/organisation";

export function useOrganisation(id: string) {
  return useQuery({
    queryKey: ["organisation", id],
    queryFn: () => getOrganisation(id),
  });
}

// Query key intentionally matches useUsers()/useInviteUser()'s ["users", id]
// shape (see ROADMAP.md Conventions) so inviting a member also refreshes
// this list, even though the fetcher hits the members-only endpoint rather
// than the admin-only GET /users.
export function useOrganisationMembers(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getOrganisationMembers(id),
    enabled: !!id,
  });
}

export function useCreateOrganisation() {
  return useMutation({
    mutationFn: (data: OrganisationInput) => createOrganisation(data),
  });
}

export function useUpdateOrganisation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrganisationInput) => updateOrganisation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation", id] });
    },
  });
}

export function useDeleteOrganisation(id: string) {
  return useMutation({
    mutationFn: () => deleteOrganisation(id),
  });
}
