"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAssignProjectMember } from "@/hooks/useProject";
import { getErrorMessage } from "@/lib/utils/errors";
import type { OrgUser } from "@/lib/types/user";

export function AssignProjectMemberDialog({
  open,
  onOpenChange,
  projectId,
  organisationId,
  availableMembers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  organisationId?: string;
  availableMembers: OrgUser[];
}) {
  const [userId, setUserId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const assignMutation = useAssignProjectMember(projectId, organisationId);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setUserId("");
      setFormError(null);
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setFormError("Select a member to add.");
      return;
    }
    setFormError(null);
    try {
      await assignMutation.mutateAsync(userId);
      handleOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Add project member</DialogTitle>
        <DialogDescription>
          Assign an organisation member to this project.
        </DialogDescription>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assign-member">Member</Label>
            {availableMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Every organisation member is already on this project.
              </p>
            ) : (
              <Select
                id="assign-member"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Select a member</option>
                {availableMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </Select>
            )}
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending || availableMembers.length === 0}
            >
              {assignMutation.isPending ? "Adding…" : "Add member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
