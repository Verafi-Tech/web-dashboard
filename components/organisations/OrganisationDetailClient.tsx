"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { EditOrganisationForm } from "@/components/organisations/EditOrganisationForm";
import { UserTable } from "@/components/users/UserTable";
import { UserInviteDialog } from "@/components/users/UserInviteDialog";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { useOrganisation, useOrganisationMembers } from "@/hooks/useOrganisation";
import { useProjects } from "@/hooks/useProjects";
import { getErrorMessage } from "@/lib/utils/errors";
import { canManageOrganisation } from "@/lib/auth/permissions";
import { Building2, Users, FolderKanban, Plus } from "lucide-react";

export function OrganisationDetailClient({ organisationId }: { organisationId: string }) {
  const { data: session } = useSession();
  const { data: organisation, isLoading, isError, error } = useOrganisation(organisationId);
  const [inviteOpen, setInviteOpen] = useState(false);

  // This org isn't necessarily the user's *active* one — look up their role
  // in THIS specific membership, not session.activeOrganisationRole.
  const membership = session?.organisations.find((org) => org.id === organisationId);
  const isAdminHere = canManageOrganisation(membership?.role);

  const members = useOrganisationMembers(organisationId);
  const projects = useProjects(organisationId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !organisation) {
    return (
      <EmptyState
        icon={Building2}
        title="Failed to load organisation"
        description={error ? getErrorMessage(error) : "Organisation not found."}
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-foreground">{organisation.name}</h2>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          {isAdminHere && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">
                Description
              </div>
              <p className="mt-1 text-sm text-foreground">
                {organisation.description || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Country</div>
              <p className="mt-1 text-sm text-foreground">{organisation.country || "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">
                Organisation code
              </div>
              <p className="mt-1 font-mono text-sm text-foreground">
                {organisation.code || "—"}
              </p>
              <p className="mt-1 text-[10.5px] text-muted-foreground">
                Field agents use this code to find your organisation at login.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground">Created</div>
              <p className="mt-1 text-sm text-foreground">
                {new Date(organisation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex flex-col gap-4">
            {isAdminHere && (
              <div className="flex justify-end">
                <Button onClick={() => setInviteOpen(true)}>
                  <Plus className="size-4" />
                  Invite user
                </Button>
              </div>
            )}

            {members.isLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : members.isError ? (
              <EmptyState
                icon={Users}
                title="Failed to load members"
                description={getErrorMessage(members.error)}
              />
            ) : !members.data || members.data.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Invite a user to get started."
              />
            ) : (
              <UserTable data={members.data} showActions={isAdminHere} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          {projects.isLoading ? (
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          ) : projects.isError ? (
            <EmptyState
              icon={FolderKanban}
              title="Failed to load projects"
              description={getErrorMessage(projects.error)}
            />
          ) : !projects.data || projects.data.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Projects for this organisation will show up here once created."
            />
          ) : (
            <ProjectsTable data={projects.data} organisationId={organisationId} />
          )}
        </TabsContent>

        {isAdminHere && (
          <TabsContent value="settings">
            <EditOrganisationForm organisation={organisation} />
          </TabsContent>
        )}
      </Tabs>

      {isAdminHere && (
        <UserInviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          organisationId={organisationId}
        />
      )}
    </div>
  );
}
