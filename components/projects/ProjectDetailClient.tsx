"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EditProjectForm } from "@/components/projects/EditProjectForm";
import { AssignProjectMemberDialog } from "@/components/projects/AssignProjectMemberDialog";
import { HouseholdsTab } from "@/components/households/HouseholdsTab";
import { UploadsList } from "@/components/uploads/UploadsList";
import { CalculationsTab } from "@/components/calculations/CalculationsTab";
import { ReportsTab } from "@/components/reports/ReportsTab";
import { useProject, useProjectMembers, useRemoveProjectMember } from "@/hooks/useProject";
import { useOrganisationMembers } from "@/hooks/useOrganisation";
import { useMethodologies } from "@/hooks/useMethodologies";
import {
  canManageProjects,
  canManageHouseholds,
  canManageCalculations,
  canManageReports,
} from "@/lib/auth/permissions";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  FolderKanban,
  Users,
  Plus,
  X,
} from "lucide-react";
import type { ProjectStatus } from "@/lib/types/project";

const STATUS_VARIANT: Record<ProjectStatus, "success" | "info" | "draft"> = {
  active: "success",
  completed: "info",
  archived: "draft",
};

export function ProjectDetailClient({
  projectId,
  organisationId,
}: {
  projectId: string;
  organisationId?: string;
}) {
  const { data: session } = useSession();
  const { data: project, isLoading, isError, error } = useProject(projectId, organisationId);
  const methodologies = useMethodologies();
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ userId: string; label: string } | null>(
    null
  );

  const membership = session?.organisations.find(
    (org) => org.id === project?.organisation_id
  );
  const isAdminHere = canManageProjects(membership?.role);
  const canManageHouseholdsHere = canManageHouseholds(membership?.role);
  const canManageCalculationsHere = canManageCalculations(membership?.role);
  const canManageReportsHere = canManageReports(membership?.role);

  const members = useProjectMembers(projectId, organisationId);
  const orgMembers = useOrganisationMembers(project?.organisation_id ?? "");
  const removeMutation = useRemoveProjectMember(projectId, organisationId);

  const resolvedMembers = useMemo(
    () =>
      (members.data ?? []).map((member) => ({
        ...member,
        user: orgMembers.data?.find((u) => u.id === member.user_id),
      })),
    [members.data, orgMembers.data]
  );

  const availableMembers = useMemo(
    () =>
      (orgMembers.data ?? []).filter(
        (u) => !members.data?.some((m) => m.user_id === u.id)
      ),
    [orgMembers.data, members.data]
  );

  const methodology = methodologies.data?.find((m) => m.id === project?.methodology_id);

  async function onRemove() {
    if (!removeTarget) return;
    try {
      await removeMutation.mutateAsync(removeTarget.userId);
      setRemoveTarget(null);
    } catch {
      // Error stays visible via the mutation's own state; dialog stays open
      // so the user can see something went wrong and retry or cancel.
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Failed to load project"
        description={error ? getErrorMessage(error) : "Project not found."}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">{project.name}</h2>
        <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="households">Households</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          {isAdminHere && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Methodology</div>
              <p className="mt-1 text-sm text-foreground">
                {methodology ? `${methodology.name} (${methodology.code})` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Location</div>
              <p className="mt-1 text-sm text-foreground">
                {project.location_description ||
                  [project.state, project.country].filter(Boolean).join(", ") ||
                  "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Start date</div>
              <p className="mt-1 text-sm text-foreground">
                {new Date(project.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">
                Verra project ID
              </div>
              <p className="mt-1 text-sm text-foreground">
                {project.verra_project_id || "Not yet registered"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Scale category</div>
              <p className="mt-1 text-sm text-foreground">{project.scale_category || "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Crediting period</div>
              <p className="mt-1 text-sm text-foreground">
                {project.crediting_period_start && project.crediting_period_end
                  ? `${new Date(project.crediting_period_start).toLocaleDateString()} – ${new Date(project.crediting_period_end).toLocaleDateString()}`
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
              <div className="text-xs font-semibold text-muted-foreground">Description</div>
              <p className="mt-1 text-sm text-foreground">{project.description || "—"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex flex-col gap-4">
            {isAdminHere && (
              <div className="flex justify-end">
                <Button onClick={() => setAssignOpen(true)}>
                  <Plus className="size-4" />
                  Add member
                </Button>
              </div>
            )}

            {members.isLoading || orgMembers.isLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : members.isError ? (
              <EmptyState
                icon={Users}
                title="Failed to load members"
                description={getErrorMessage(members.error)}
              />
            ) : resolvedMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Add an organisation member to get started."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        Member
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        Role
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                        Assigned
                      </th>
                      {isAdminHere && <th className="px-4 py-2.5" />}
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedMembers.map((member) => (
                      <tr key={member.user_id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">
                            {member.user?.full_name ?? "Unknown user"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.user?.email ?? member.user_id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {member.user && (
                            <Badge variant={member.user.role === "admin" ? "success" : "draft"}>
                              {member.user.role}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(member.assigned_at).toLocaleDateString()}
                        </td>
                        {isAdminHere && (
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove member"
                              onClick={() =>
                                setRemoveTarget({
                                  userId: member.user_id,
                                  label: member.user?.email ?? member.user_id,
                                })
                              }
                            >
                              <X className="size-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="households">
          <HouseholdsTab
            projectId={projectId}
            organisationId={organisationId}
            canManage={canManageHouseholdsHere}
          />
        </TabsContent>

        <TabsContent value="uploads">
          <UploadsList
            projectId={projectId}
            organisationId={organisationId}
            canManage={isAdminHere}
          />
        </TabsContent>

        <TabsContent value="calculations">
          <CalculationsTab
            projectId={projectId}
            organisationId={organisationId}
            canManage={canManageCalculationsHere}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab
            projectId={projectId}
            organisationId={organisationId}
            canManage={canManageReportsHere}
          />
        </TabsContent>

        {isAdminHere && (
          <TabsContent value="settings">
            <EditProjectForm project={project} organisationId={organisationId} />
          </TabsContent>
        )}
      </Tabs>

      {isAdminHere && (
        <AssignProjectMemberDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          projectId={projectId}
          organisationId={organisationId}
          availableMembers={availableMembers}
        />
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove project member"
        description={
          removeTarget
            ? `This removes ${removeTarget.label} from ${project.name}.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={onRemove}
        isPending={removeMutation.isPending}
      />
    </div>
  );
}
