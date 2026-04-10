/**
 * Pure logic used by LayoutChrome to decide whether the current route
 * should render the app shell (Header, main wrapper, Footer) or hand the
 * full viewport over to the page (e.g., the immersive /play route).
 *
 * Extracted so it can be unit-tested without mounting React.
 */
const IMMERSIVE_PATTERN = /(^|\/)(play)(\/|$)/

export function isImmersiveRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return IMMERSIVE_PATTERN.test(pathname)
}
