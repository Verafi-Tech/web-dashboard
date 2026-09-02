"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Badge } from "@/components/ui/badge";

export function OrganisationPicker() {
  const { data: session, update } = useSession();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const organisations = session?.organisations ?? [];

  async function selectOrganisation(organisationId: string) {
    setSelectingId(organisationId);
    await update({ activeOrganisationId: organisationId });
    // Hard navigation, not router.push: Next's client Router Cache can still
    // hold a pre-selection render of /dashboard, and router.refresh() runs
    // too late (after push already committed) to invalidate it in time.
    window.location.href = "/dashboard";
  }

  if (organisations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-xl font-bold text-foreground">
          No organisations yet
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {session?.user?.email} doesn&apos;t belong to any organisation yet.
          Ask an admin to invite you, or create one of your own.
        </p>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-foreground">
          Choose an organisation
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session?.user?.email}
        </p>
      </div>
      {organisations.map((org) => (
        <button
          key={org.id}
          onClick={() => selectOrganisation(org.id)}
          disabled={selectingId !== null}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-ring disabled:opacity-50"
        >
          <span className="text-sm font-semibold text-foreground">
            {org.name}
          </span>
          {selectingId === org.id ? (
            <span className="text-xs text-muted-foreground">Entering…</span>
          ) : (
            <Badge variant={org.role === "admin" ? "success" : "draft"}>
              {org.role}
            </Badge>
          )}
        </button>
      ))}
      <SignOutButton />
    </div>
  );
}
