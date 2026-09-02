import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageMethodologyTemplates } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { MethodologyDetailClient } from "@/components/methodologies/MethodologyDetailClient";

export default async function MethodologyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!canManageMethodologyTemplates(session?.activeOrganisationRole)) {
    redirect("/dashboard/methodologies");
  }

  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Survey template"
        description="Configure the fields field agents fill out for this methodology."
      />
      <MethodologyDetailClient methodologyId={id} />
    </div>
  );
}
