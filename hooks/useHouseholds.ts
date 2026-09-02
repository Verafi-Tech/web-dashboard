import { useQuery } from "@tanstack/react-query";
import { listHouseholds } from "@/lib/api/households";

export function useHouseholds(projectId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["households", projectId],
    queryFn: () => listHouseholds(projectId, organisationId),
    enabled: !!projectId,
  });
}
