function Skeleton({ className = "h-24 w-full" }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function StatSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[7.75rem] w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, label = "Loading records..." }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-11 max-w-md flex-1 rounded-2xl" />
        <p className="shrink-0 text-xs font-medium text-slate-400">{label}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="border-b border-white/8 px-4 py-3">
          <Skeleton className="h-4 w-full max-w-lg rounded-lg" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0"
          >
            <Skeleton className="h-4 w-1/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-4 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
