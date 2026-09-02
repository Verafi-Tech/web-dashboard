"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useUploadStats } from "@/hooks/useUpload";
import { getErrorMessage } from "@/lib/utils/errors";
import { formatBytes } from "@/lib/utils/format";
import { HardDrive } from "lucide-react";

export function StorageStats() {
  const { data, isLoading, isError, error } = useUploadStats();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={HardDrive}
        title="Failed to load storage stats"
        description={getErrorMessage(error)}
      />
    );
  }

  const isNearQuota = data.quota_percentage > 80;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard label="Storage used" value={formatBytes(data.total_storage_used)} />
        <StatsCard label="Files" value={data.file_count} />
        <StatsCard label="Quota used" value={`${data.quota_percentage.toFixed(1)}%`} />
      </div>
      {isNearQuota && (
        <div className="rounded-lg border border-warn-dot/20 bg-warn-bg px-4 py-3 text-sm text-warn">
          Storage is at {data.quota_percentage.toFixed(1)}% of the{" "}
          {formatBytes(data.storage_quota)} quota. Delete unused files or
          contact support to increase it.
        </div>
      )}
    </div>
  );
}
