// Explicit not-found boundary for the Keystatic segment. The page guard
// (page.tsx) calls notFound() when the CMS is disabled in production; without
// a not-found boundary inside this segment's own root layout, Next.js renders
// the global 404 UI but leaves the response status at 200. Defining it here
// makes the production lockdown return a real 404 status.
export default function KeystaticNotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'system-ui, sans-serif',
        color: '#1f2937',
        background: '#ffffff',
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>404 — Not Found</h1>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
        This page could not be found.
      </p>
    </main>
  )
}
