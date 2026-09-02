import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/api/projects";

export function useProjects(organisationId: string) {
  return useQuery({
    queryKey: ["projects", organisationId],
    queryFn: () => listProjects(organisationId),
    enabled: !!organisationId,
  });
}
