import { useMutation } from "@tanstack/react-query";
import { setRetentionPolicy, purgeExpiredRecords } from "@/lib/api/audit";
import type { RetentionPolicyInput } from "@/lib/types/audit";

// Plain mutations, no query invalidation — nothing else in the app reads
// this data (there's no GET endpoint to list configured policies at all).
export function useSetRetentionPolicy(organisationId?: string) {
  return useMutation({
    mutationFn: (data: RetentionPolicyInput) => setRetentionPolicy(data, organisationId),
  });
}

export function usePurgeExpiredRecords(organisationId?: string) {
  return useMutation({
    mutationFn: () => purgeExpiredRecords(organisationId),
  });
}
