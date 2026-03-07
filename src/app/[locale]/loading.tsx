export default function Loading() {
  return (
    <div className="animate-pulse space-y-8 pt-12">
      <div className="space-y-4">
        <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded" />
        <div className="h-10 w-64 bg-[var(--bg-elevated)] rounded" />
        <div className="h-6 w-48 bg-[var(--bg-elevated)] rounded" />
        <div className="h-4 w-96 bg-[var(--bg-elevated)] rounded" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border-default)] p-5 space-y-3">
            <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded" />
            <div className="h-5 w-full bg-[var(--bg-elevated)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--bg-elevated)] rounded" />
            <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
