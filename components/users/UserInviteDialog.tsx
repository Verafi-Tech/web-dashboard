"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInviteUser } from "@/hooks/useUser";
import { getErrorMessage } from "@/lib/utils/errors";
import type { InviteUserResult } from "@/lib/types/user";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["admin", "field_agent", "viewer"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function UserInviteDialog({
  open,
  onOpenChange,
  organisationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisationId?: string;
}) {
  const [result, setResult] = useState<InviteUserResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inviteMutation = useInviteUser(organisationId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "field_agent" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setResult(null);
      setFormError(null);
      setCopied(false);
      reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: InviteFormData) {
    setFormError(null);
    try {
      setResult(await inviteMutation.mutateAsync(data));
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function copyPassword() {
    if (!result?.temporary_password) return;
    await navigator.clipboard.writeText(result.temporary_password);
    setCopied(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>Invite user</DialogTitle>
        {result ? (
          <>
            <DialogDescription>
              {result.user.email} has been added to this organisation.
              {result.temporary_password
                ? " Share this temporary password with them securely — it won't be shown again."
                : " They already had an account, so their existing password is unchanged."}
            </DialogDescription>
            {result.temporary_password && (
              <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
                <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground">
                  {result.temporary_password}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy temporary password"
                  onClick={copyPassword}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <DialogDescription>
              Sends an invitation to join this organisation.
            </DialogDescription>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-3"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <Select id="invite-role" {...register("role")}>
                  <option value="admin">Admin</option>
                  <option value="field_agent">Field agent</option>
                  <option value="viewer">Viewer</option>
                </Select>
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
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Sending…" : "Send invite"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
