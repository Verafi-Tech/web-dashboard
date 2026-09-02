"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/useUser";
import { getErrorMessage } from "@/lib/utils/errors";
import { Users } from "lucide-react";
import type { UserRole } from "@/lib/types/user";

type ProfileFormData = {
  role: UserRole;
  is_active: boolean;
};

export function UserProfileClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useUser(userId);
  const updateMutation = useUpdateUser(userId);
  const deleteMutation = useDeleteUser(userId);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { control, register, handleSubmit, formState } = useForm<ProfileFormData>({
    values: user ? { role: user.role, is_active: user.is_active } : undefined,
  });

  async function onSubmit(data: ProfileFormData) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync(data);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function onDelete() {
    try {
      await deleteMutation.mutateAsync();
      router.push("/dashboard/users");
    } catch (err) {
      setFormError(getErrorMessage(err));
      setDeleteOpen(false);
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !user) {
    return (
      <EmptyState
        icon={Users}
        title="Failed to load user"
        description={error ? getErrorMessage(error) : "User not found."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={user.full_name} description={user.email} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-role">Role</Label>
            <Select id="user-role" {...register("role")}>
              <option value="admin">Admin</option>
              <option value="field_agent">Field agent</option>
              <option value="viewer">Viewer</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <div className="flex items-center gap-2 pt-1.5">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm text-muted-foreground">
                {formState.isDirty ? "" : user.is_active ? "Active" : "Suspended"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-2">
          <div>Created {new Date(user.created_at).toLocaleDateString()}</div>
          <div>Updated {new Date(user.updated_at).toLocaleDateString()}</div>
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <h3 className="text-sm font-bold text-foreground">Danger zone</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Suspending or deleting the last admin in an organisation is blocked
          by the server.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          onClick={() => setDeleteOpen(true)}
        >
          Delete user
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user"
        description={`This permanently removes ${user.email}. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={onDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
