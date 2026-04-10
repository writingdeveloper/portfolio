import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest, NextResponse } from 'next/server'

// Renamed from middleware.ts to proxy.ts to follow the Next.js 16.2+
// file convention (the "middleware" name is deprecated). Behavior is
// identical — per-request CSP nonce composed with next-intl routing.
const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // Generate a per-request nonce for CSP.
  // Using crypto.randomUUID() keeps this compatible with the edge runtime.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const isDev = process.env.NODE_ENV === 'development'

  // Next.js dev needs 'unsafe-eval' for HMR; production does not.
  // We deliberately do NOT use 'strict-dynamic' here — Vercel Analytics /
  // Speed Insights inject same-origin /_vercel/*/script.js tags at runtime
  // without nonces, which strict-dynamic would block. 'self' + nonce still
  // blocks any inline / cross-origin script injection we care about.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    'https://giscus.app',
    'https://va.vercel-scripts.com',
    isDev ? "'unsafe-eval'" : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cspHeader = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // style-src still needs 'unsafe-inline' for Tailwind / inline styles.
    // Moving these to nonce would require invasive refactoring.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://giscus.app https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.github.com",
    'frame-src https://giscus.app',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  // Mutate the incoming request headers so RSC can read the nonce via next/headers.
  // Next.js middleware composition shares the request object across middlewares,
  // so this propagates to the next-intl middleware and downstream handlers.
  request.headers.set('x-nonce', nonce)
  // Expose the pathname to server components. LocaleLayout uses this to
  // decide whether to render the Header/Footer chrome or hand the full
  // viewport to the page (immersive /play route).
  request.headers.set('x-pathname', request.nextUrl.pathname)

  const response = intlMiddleware(request) as NextResponse
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: ['/((?!api|keystatic|_next|_vercel|.*\\..*).*)'],
}
