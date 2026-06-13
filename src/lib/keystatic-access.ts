/**
 * Keystatic is configured in LOCAL storage mode unless a GitHub App slug is
 * provided (see keystatic.config.ts). Local mode reads/writes the repo
 * filesystem, which is meaningless on Vercel's read-only, ephemeral runtime —
 * yet the admin UI (`/keystatic/*`) and its route handler (`/api/keystatic/*`)
 * are excluded from the proxy matcher and so ship in the production build with
 * no auth in front of them. That exposes the full CMS surface to anonymous
 * visitors.
 *
 * Guard: in a production build with no GitHub storage configured, treat the
 * CMS as disabled (callers return 404). When GitHub storage IS configured,
 * Keystatic enforces its own GitHub OAuth, so we leave it accessible. Locally
 * (NODE_ENV !== 'production') the CMS stays fully available for editing.
 */
export function isKeystaticDisabled(): boolean {
  const isProd = process.env.NODE_ENV === 'production'
  const hasGitHubStorage = Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG)
  return isProd && !hasGitHubStorage
}
