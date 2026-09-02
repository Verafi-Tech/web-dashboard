import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  delta,
  deltaDirection = "up",
  isLoading,
  isError,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: "up" | "down";
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      {isLoading ? (
        <div className="h-8 w-12 animate-pulse rounded bg-muted" />
      ) : (
        <div
          className={cn(
            "text-2xl font-extrabold",
            isError ? "text-muted-foreground" : "text-primary"
          )}
          title={isError ? "Failed to load" : undefined}
        >
          {isError ? "—" : value}
        </div>
      )}
      <div className="mt-1 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-2 text-[10.5px] font-bold",
            deltaDirection === "up" ? "text-success" : "text-danger"
          )}
        >
          {deltaDirection === "up" ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}
