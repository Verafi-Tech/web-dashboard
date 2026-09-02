import { auth } from "@/auth";
import { canViewSettings } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserSettingsForm } from "@/components/settings/UserSettingsForm";
import { StorageStats } from "@/components/settings/StorageStats";
import { UploadsList } from "@/components/uploads/UploadsList";
import { RetentionPolicyForm } from "@/components/settings/RetentionPolicyForm";
import { PurgeRecordsButton } from "@/components/settings/PurgeRecordsButton";

export default async function SettingsPage() {
  const session = await auth();
  const showStorage = canViewSettings(session?.activeOrganisationRole);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <PageHeader
        title="Settings"
        description="Your profile and account preferences."
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">My profile</h2>
        <UserSettingsForm />
      </div>

      {showStorage && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground">Storage</h2>
          <StorageStats />
          <UploadsList canManage />
        </div>
      )}

      {showStorage && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground">Data retention</h2>
          <RetentionPolicyForm />
          <PurgeRecordsButton />
        </div>
      )}
    </div>
  );
}
