"use client";

import { useMethodologies } from "@/hooks/useMethodologies";
import { MethodologyTable } from "@/components/methodologies/MethodologyTable";
import { EmptyState } from "@/components/common/EmptyState";
import { getErrorMessage } from "@/lib/utils/errors";
import { FlaskConical } from "lucide-react";

export function MethodologiesListClient() {
  const { data, isLoading, isError, error } = useMethodologies();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="Failed to load methodologies"
        description={getErrorMessage(error)}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No methodologies yet"
        description="Methodologies are configured on the backend; once added, they'll show up here."
      />
    );
  }

  return <MethodologyTable data={data} />;
}
