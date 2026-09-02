"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { CreateOrganisationDialog } from "@/components/organisations/CreateOrganisationDialog";
import { cn } from "@/lib/utils";
import { Building2, Plus } from "lucide-react";

export function OrganisationsListClient() {
  const { data: session } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const organisations = session?.organisations ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New organisation
        </Button>
      </div>

      {organisations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organisations yet"
          description="You don't belong to any organisation. Create one to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Your role
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {organisations.map((org) => (
                <tr key={org.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {org.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={org.role === "admin" ? "success" : "draft"}>
                      {org.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/organisations/${org.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateOrganisationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
