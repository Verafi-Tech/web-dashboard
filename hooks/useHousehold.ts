import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHousehold,
  createHousehold,
  updateHousehold,
  deleteHousehold,
} from "@/lib/api/households";
import type { HouseholdInput, HouseholdUpdateInput } from "@/lib/types/household";

export function useHousehold(id: string, organisationId?: string) {
  return useQuery({
    queryKey: ["household", id],
    queryFn: () => getHousehold(id, organisationId),
    enabled: !!id,
  });
}

export function useCreateHousehold(projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HouseholdInput) => createHousehold(projectId, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households", projectId] });
    },
  });
}

export function useUpdateHousehold(id: string, projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HouseholdUpdateInput) => updateHousehold(id, data, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household", id] });
      queryClient.invalidateQueries({ queryKey: ["households", projectId] });
    },
  });
}

export function useDeleteHousehold(id: string, projectId: string, organisationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteHousehold(id, organisationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households", projectId] });
    },
  });
}
