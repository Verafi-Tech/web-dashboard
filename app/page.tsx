import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * proxy.ts already redirects every case for "/" before this ever renders
 * (see lib/auth/route-guard.ts). This is a defense-in-depth fallback only.
 */
export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if (session.activeOrganisationRole === "admin") {
    redirect("/dashboard");
  }
  redirect("/select-organisation");
}
