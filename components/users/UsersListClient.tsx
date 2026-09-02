"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { UserTable } from "@/components/users/UserTable";
import { UserInviteDialog } from "@/components/users/UserInviteDialog";
import { useUsers } from "@/hooks/useUsers";
import { getErrorMessage } from "@/lib/utils/errors";
import { Users, Plus } from "lucide-react";

export function UsersListClient() {
  const { data, isLoading, isError, error } = useUsers();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="size-4" />
          Invite user
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Failed to load users"
          description={getErrorMessage(error)}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Invite a user to get started."
        />
      ) : (
        <UserTable data={data} />
      )}

      <UserInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
