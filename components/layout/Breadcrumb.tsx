"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// These segments only exist as the parent of a nested detail route (e.g.
// .../projects/{id}/households/{householdId}) — the collection itself is a
// tab inside the project page, not a standalone route, so a breadcrumb link
// to it alone would 404. Extend this set as new nested-detail-only routes
// are added.
const NON_NAVIGABLE_SEGMENTS = new Set(["households", "calculations", "reports"]);

// A route param (project id, household id, ...) isn't in NAV_ITEMS, so it
// falls through to the raw URL segment. Left untruncated, a full UUID (or
// two, on the nested household route) blows the breadcrumb past one line —
// shorten it to a short prefix, same convention as a git short hash, and
// keep the full value in a title tooltip so it's not lost entirely.
function labelFor(href: string): { label: string; full?: string } {
  const match = NAV_ITEMS.find((item) => item.href === href);
  if (match) return { label: match.label };

  const segment = href.split("/").pop() ?? "";
  if (UUID_PATTERN.test(segment)) {
    return { label: `${segment.slice(0, 8)}…`, full: segment };
  }
  return { label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ") };
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "methodologies", ...]

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { href, segment, ...labelFor(href) };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isNavigable = !isLast && !NON_NAVIGABLE_SEGMENTS.has(crumb.segment);
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            {isNavigable ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground"
                title={crumb.full}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(isLast ? "font-semibold text-foreground" : "text-muted-foreground")}
                title={crumb.full}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
