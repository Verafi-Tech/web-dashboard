"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 px-6 py-12">
      <h2 className="text-lg font-bold text-foreground">Failed to load</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Something went wrong loading this page."}
      </p>
      <Button variant="secondary" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
