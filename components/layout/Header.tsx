"use client";

import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const activeOrg = session?.organisations.find(
    (org) => org.id === session.activeOrganisationId
  );

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        {activeOrg && (
          <Link
            href="/select-organisation"
            className="hidden rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-ring hover:text-foreground sm:inline-block"
          >
            {activeOrg.name}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          <Sun className="size-4 scale-100 dark:scale-0" />
          <Moon className="absolute size-4 scale-0 dark:scale-100" />
        </Button>
        <SignOutButton />
      </div>
    </header>
  );
}
