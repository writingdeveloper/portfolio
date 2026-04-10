export default function BlogLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-24"
    >
      <div className="text-sm text-[var(--text-muted)]">Loading posts…</div>
    </div>
  )
}
