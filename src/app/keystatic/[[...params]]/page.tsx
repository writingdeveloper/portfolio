import { notFound } from 'next/navigation'
import KeystaticApp from '../keystatic'
import { getTranslationStatus } from '@/lib/translation-status'
import { isKeystaticDisabled } from '@/lib/keystatic-access'

// Render per-request, not at build. A statically prerendered notFound() bakes
// the 404 UI into a 200 response; rendering dynamically lets notFound() set a
// real 404 status (with the segment's not-found.tsx boundary).
export const dynamic = 'force-dynamic'

function TranslationBanner() {
  const { untranslated } = getTranslationStatus()
  if (untranslated.length === 0) return null

  const names = untranslated.slice(0, 3).join(', ')
  const extra = untranslated.length > 3 ? ` 외 ${untranslated.length - 3}건` : ''

  return (
    <div style={{
      padding: '10px 16px',
      backgroundColor: 'var(--warning-bg, #fef3c7)',
      color: 'var(--warning-text, #92400e)',
      fontSize: '14px',
      borderBottom: '1px solid var(--warning-border, #fcd34d)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ fontSize: '16px' }}>&#9888;</span>
      <span>
        <strong>번역 필요:</strong> {names}{extra} ({untranslated.length}건)
      </span>
    </div>
  )
}

export default function KeystaticPage() {
  // Block the local-mode CMS on production (see isKeystaticDisabled). Thrown
  // from the page (not the root layout), this yields a real 404 response.
  if (isKeystaticDisabled()) {
    notFound()
  }

  return (
    <>
      <TranslationBanner />
      <KeystaticApp />
    </>
  )
}
