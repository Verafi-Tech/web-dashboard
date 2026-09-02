import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageUsers } from "@/lib/auth/permissions";
import { UserProfileClient } from "@/components/users/UserProfileClient";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!canManageUsers(session?.activeOrganisationRole)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 lg:px-8">
      <UserProfileClient userId={id} />
    </div>
  );
}
