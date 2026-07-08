/**
 * Pure logic used by LayoutChrome to decide whether the current route
 * should render the app shell (Header, main wrapper, Footer) or hand the
 * full viewport over to the page (e.g., the immersive /play route).
 *
 * Extracted so it can be unit-tested without mounting React.
 */
const IMMERSIVE_PATTERN = /(^|\/)(play)(\/|$)/

// The home route ('/', '/en', '/ko') renders the bespoke immersive "Builder's
// Ledger" layout — its own header/footer/sections — so it bypasses the app
// shell (Header, max-w main, Footer) just like /play.
const HOME_PATTERN = /^\/(ko|en)?\/?$/

export function isImmersiveRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return IMMERSIVE_PATTERN.test(pathname) || HOME_PATTERN.test(pathname)
}
