"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Home } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { EditHouseholdForm } from "@/components/households/EditHouseholdForm";
import { SurveysTab } from "@/components/surveys/SurveysTab";
import { useHousehold } from "@/hooks/useHousehold";
import { useProject } from "@/hooks/useProject";
import { canManageHouseholds } from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/utils/errors";

function projectHref(projectId: string, organisationId?: string) {
  return organisationId
    ? `/dashboard/projects/${projectId}?org=${organisationId}`
    : `/dashboard/projects/${projectId}`;
}

export function HouseholdDetailClient({
  householdId,
  projectId,
  organisationId,
}: {
  householdId: string;
  projectId: string;
  organisationId?: string;
}) {
  const { data: session } = useSession();
  const { data: household, isLoading, isError, error } = useHousehold(
    householdId,
    organisationId
  );
  const { data: project } = useProject(projectId, organisationId);

  const membership = session?.organisations.find(
    (org) => org.id === project?.organisation_id
  );
  const canManage = canManageHouseholds(membership?.role);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !household) {
    return (
      <EmptyState
        icon={Home}
        title="Failed to load household"
        description={error ? getErrorMessage(error) : "Household not found."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={projectHref(projectId, organisationId)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to project
      </Link>

      <div>
        <h2 className="font-mono text-lg font-bold text-foreground">
          {household.household_code}
        </h2>
        <p className="text-sm text-muted-foreground">
          {household.head_of_household || "No head of household recorded"}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Household size
                </div>
                <p className="mt-1 text-sm text-foreground">{household.household_size}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Adult equivalents
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {household.hh_equiv_adults ?? "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Composition
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {household.hh_children_0_14 ?? 0} children · {household.hh_female_over_14 ?? 0} females 15+ ·{" "}
                  {household.hh_male_15_59 ?? 0} males 15-59 · {household.hh_male_over_59 ?? 0} males 60+
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">Enrolled</div>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(household.enrolment_date).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">Community</div>
                <p className="mt-1 text-sm text-foreground">{household.community || "—"}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Stove / fuel
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {household.old_stove_type || "—"} → {household.new_stove_type || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fuel: {household.primary_fuel_type || "—"}
                  {household.stove_serial_number && ` · Serial: ${household.stove_serial_number}`}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground">
                  Sync status
                </div>
                <p className="mt-1 text-sm text-foreground">{household.sync_status}</p>
              </div>
            </div>

            {canManage && (
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-foreground">Edit household</h3>
                <EditHouseholdForm
                  household={household}
                  projectId={projectId}
                  organisationId={organisationId}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="surveys">
          <SurveysTab
            householdId={householdId}
            projectId={projectId}
            organisationId={organisationId}
            canManage={canManage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
