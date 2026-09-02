import { useQuery } from "@tanstack/react-query";
import { listSurveys } from "@/lib/api/surveys";

export function useSurveys(householdId: string, organisationId?: string) {
  return useQuery({
    queryKey: ["surveys", householdId],
    queryFn: () => listSurveys(householdId, organisationId),
    enabled: !!householdId,
  });
}
