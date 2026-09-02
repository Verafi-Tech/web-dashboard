"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRequestPasswordReset } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/utils/errors";
import { UserCircle } from "lucide-react";

const userSettingsSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(255),
});

type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

export function UserSettingsForm() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { data: user, isLoading, isError, error } = useUser(userId);
  const updateMutation = useUpdateUser(userId);
  const resetMutation = useRequestPasswordReset();

  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    values: user ? { full_name: user.full_name } : undefined,
  });

  async function onSubmit(data: UserSettingsFormData) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ full_name: data.full_name });
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  async function onRequestReset() {
    if (!user?.email) return;
    setFormError(null);
    setResetSent(false);
    try {
      await resetMutation.mutateAsync(user.email);
      setResetSent(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !user) {
    return (
      <EmptyState
        icon={UserCircle}
        title="Failed to load your profile"
        description={error ? getErrorMessage(error) : "Profile not found."}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-name">Name</Label>
        <Input id="settings-name" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-email">Email</Label>
        <Input id="settings-email" value={user.email} disabled />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="mt-2 flex items-center justify-between">
        <div>
          <Button type="button" variant="secondary" onClick={onRequestReset} disabled={resetMutation.isPending}>
            {resetMutation.isPending ? "Sending…" : "Send password reset email"}
          </Button>
          {resetSent && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              If an account exists for {user.email}, a reset link has been sent.
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
