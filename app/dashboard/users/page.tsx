import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageUsers } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { UsersListClient } from "@/components/users/UsersListClient";

export default async function UsersPage() {
  const session = await auth();
  if (!canManageUsers(session?.activeOrganisationRole)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Users"
        description="Manage users, roles, and invitations for this organisation."
      />
      <UsersListClient />
    </div>
  );
}
