/**
 * Classification for outbound-link analytics.
 *
 * GA4 counted zero key events because the site only ever sent pageviews. The
 * things worth counting on a portfolio are all departures: someone opening a
 * live demo, the source, a store listing, or the mail client. Those are the
 * moments the site did its job.
 *
 * This module is deliberately pure — no DOM, no gtag — so the rules can be
 * tested directly. The listener that uses it lives in OutboundTracker.
 */

/** Event names are sent to GA4 verbatim; they are what gets marked as a key
 *  event in the console, so they must stay stable once data starts landing. */
export type OutboundEventName =
  | 'demo_click'
  | 'code_click'
  | 'play_store_click'
  | 'contact_click'

export interface OutboundEvent {
  name: OutboundEventName
  params: {
    /** Identifies which project was opened — every demo has a distinct URL. */
    link_url: string
    link_domain: string
  }
}

const PLAY_STORE_HOSTS = new Set(['play.google.com'])
const CODE_HOSTS = new Set(['github.com', 'gitlab.com', 'bitbucket.org'])
/** Profiles that are a way to reach a person, not a product to try. Without
 *  this they fall through to demo_click and quietly inflate that metric —
 *  which they did for as long as the footer has linked LinkedIn. */
const CONTACT_HOSTS = new Set(['linkedin.com'])

/** `www.` is presentation, not identity — two hosts that differ only by it are
 *  the same destination, and GA4 reports read better without the split. */
function normalizeHost(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase()
}

/**
 * Decide whether a click on `href` is worth reporting, and as what.
 *
 * Returns null for everything that is not a departure: in-page anchors,
 * internal navigation, and protocols we do not want to reason about (tel:,
 * javascript:, blob:, …). `siteHost` is the current page's host, so a link to
 * one of the author's own product subdomains still counts as leaving — which
 * is right, since that is exactly the demo click worth measuring.
 *
 * The internal check compares host to host, port included. Comparing the
 * URL's port-free `hostname` against a `location.host` that carries one made
 * every internal link on `localhost:3000` report as an outbound demo click,
 * which would have quietly inflated the very metric this exists to produce.
 * `link_domain` still reports the port-free hostname, which is what reads well
 * in GA4.
 */
export function classifyOutboundLink(href: string, siteHost: string): OutboundEvent | null {
  const trimmed = href.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  if (/^mailto:/i.test(trimmed)) {
    const address = trimmed.slice('mailto:'.length).split('?')[0]
    const domain = address.includes('@') ? address.split('@').pop()! : ''
    if (!domain) return null
    return { name: 'contact_click', params: { link_url: trimmed, link_domain: normalizeHost(domain) } }
  }

  let url: URL
  try {
    // A base makes relative hrefs resolve instead of throwing; they then fail
    // the same-host check below and drop out as internal, which is correct.
    url = new URL(trimmed, `https://${siteHost}`)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  if (!url.hostname) return null
  if (normalizeHost(url.host) === normalizeHost(siteHost)) return null

  const host = normalizeHost(url.hostname)
  const params = { link_url: url.href, link_domain: host }

  if (PLAY_STORE_HOSTS.has(host)) return { name: 'play_store_click', params }
  if (CODE_HOSTS.has(host)) return { name: 'code_click', params }
  if (CONTACT_HOSTS.has(host)) return { name: 'contact_click', params }
  return { name: 'demo_click', params }
}
