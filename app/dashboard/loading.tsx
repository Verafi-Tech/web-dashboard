export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
