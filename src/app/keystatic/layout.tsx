import type { ReactNode } from 'react'

// Pure HTML shell for the Keystatic segment. The CMS itself and its
// production guard live in the page (keystatic/[[...params]]/page.tsx) so that
// a disabled CMS returns a real 404 status — notFound() thrown from a root
// layout renders the 404 UI but leaves the response status at 200.
export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
