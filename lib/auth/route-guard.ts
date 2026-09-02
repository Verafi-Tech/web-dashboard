export type RouteSession = {
  activeOrganisationId?: string;
  activeOrganisationRole?: string;
} | null;

const PROTECTED_PREFIX = "/dashboard";
const ORG_PICKER = "/select-organisation";

/**
 * Pure redirect decision for a request, kept separate from proxy.ts so it's
 * testable without spinning up the Next.js request/response machinery.
 *
 * Runs in proxy.ts (before any rendering) so redirects are real HTTP 307s,
 * not a render-time `redirect()` call that can race Next's streaming shell.
 *
 * Role is per-organisation (UserOrganisationMembership on the backend), not
 * global — but at the route level, "authorized for /dashboard" only means
 * signed in and has picked an organisation. Any role may enter; which
 * *features* a role can reach inside /dashboard is a separate, per-page/nav
 * concern handled by lib/auth/permissions.ts, not this gate (see
 * ROADMAP.md's Phase 1 notes on why a blanket admin-only route block doesn't
 * fit a multi-role product).
 */
export function getRedirectForRequest(
  pathname: string,
  session: RouteSession
): string | null {
  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const hasActiveOrganisation = !!session?.activeOrganisationId;

  if (isProtectedRoute) {
    if (!session) return "/login";
    if (!hasActiveOrganisation) return ORG_PICKER;
    return null;
  }

  if (pathname === ORG_PICKER) {
    return session ? null : "/login";
  }

  if (pathname === "/login" || pathname === "/") {
    if (!session) return pathname === "/" ? "/login" : null;
    return hasActiveOrganisation ? PROTECTED_PREFIX : ORG_PICKER;
  }

  return null;
}
