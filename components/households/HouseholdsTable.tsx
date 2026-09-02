import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Household } from "@/lib/types/household";

function householdHref(projectId: string, household: Household, organisationId?: string) {
  const base = `/dashboard/projects/${projectId}/households/${household.id}`;
  return organisationId ? `${base}?org=${organisationId}` : base;
}

export function HouseholdsTable({
  data,
  projectId,
  organisationId,
}: {
  data: Household[];
  projectId: string;
  organisationId?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Code
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Head of household
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Community
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Size
            </th>
            <th className="px-4 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Enrolled
            </th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {data.map((household) => (
            <tr key={household.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                {household.household_code}
              </td>
              <td className="px-4 py-3">{household.head_of_household || "—"}</td>
              <td className="px-4 py-3">{household.community || "—"}</td>
              <td className="px-4 py-3">{household.household_size}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(household.enrolment_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={householdHref(projectId, household, organisationId)}
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
  );
}
