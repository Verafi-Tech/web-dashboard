import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { listUsers } from "@/lib/api/users";
import { canManageUsers } from "@/lib/auth/permissions";

// GET /users is admin-only — never fire it for a non-admin, regardless of
// which page calls this hook, so a role check isn't left to each call site.
export function useUsers() {
  const { data: session } = useSession();
  const activeOrganisationId = session?.activeOrganisationId;

  return useQuery({
    queryKey: ["users", activeOrganisationId],
    queryFn: () => listUsers(),
    enabled: !!activeOrganisationId && canManageUsers(session?.activeOrganisationRole),
  });
}
