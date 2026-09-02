import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUser, updateUser, deleteUser, inviteUser } from "@/lib/api/users";
import type { UpdateUserInput, InviteUserInput } from "@/lib/types/user";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    // Every existing caller passes a real id from a route param; the new
    // self-service Settings form passes session?.user?.id, which is
    // genuinely undefined during initial load — guard so that doesn't fire
    // a request against an empty id.
    enabled: !!userId,
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({
        queryKey: ["users", session?.activeOrganisationId],
      });
    },
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", session?.activeOrganisationId],
      });
    },
  });
}

export function useInviteUser(organisationId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const targetOrganisationId = organisationId ?? session?.activeOrganisationId;

  return useMutation({
    mutationFn: (data: InviteUserInput) => {
      if (!targetOrganisationId) throw new Error("No active organisation selected");
      return inviteUser(targetOrganisationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", targetOrganisationId] });
    },
  });
}
