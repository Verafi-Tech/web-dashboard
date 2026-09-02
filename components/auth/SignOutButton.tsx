"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button variant="secondary" onClick={() => signOut({ redirectTo: "/login" })}>
      Sign out
    </Button>
  );
}
