export default function PostLoading() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto">
      <div className="space-y-4 mb-10">
        <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded" />
        <div className="h-10 w-3/4 bg-[var(--bg-elevated)] rounded" />
        <div className="h-4 w-48 bg-[var(--bg-elevated)] rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-[var(--bg-elevated)] rounded" style={{ width: `${75 + (i % 4) * 7}%` }} />
        ))}
      </div>
    </div>
  )
}
