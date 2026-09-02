"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePurgeExpiredRecords } from "@/hooks/useRetentionPolicy";
import { getErrorMessage } from "@/lib/utils/errors";

export function PurgeRecordsButton({ organisationId }: { organisationId?: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const purgeMutation = usePurgeExpiredRecords(organisationId);

  async function onConfirm() {
    setError(null);
    try {
      const response = await purgeMutation.mutateAsync();
      setResult(response);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Purge expired records
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <p className="rounded-lg border border-success/30 bg-success-bg p-3 text-sm text-success">
          {typeof result.message === "string"
            ? result.message
            : typeof result.purged_count === "number"
              ? `Purge complete — ${result.purged_count} record(s) removed.`
              : "Purge complete."}
        </p>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Purge expired records"
        description="This permanently deletes or anonymizes audit records past their configured retention period, per whatever policies are currently active. This cannot be undone."
        confirmLabel="Purge"
        onConfirm={onConfirm}
        isPending={purgeMutation.isPending}
      />
    </div>
  );
}
