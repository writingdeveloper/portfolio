import { describe, expect, it } from 'vitest'
import { classifyOutboundLink } from '../analytics'

const SITE = 'writingdeveloper.blog'

describe('classifyOutboundLink', () => {
  it('ignores in-page anchors and empty hrefs', () => {
    expect(classifyOutboundLink('#main-content', SITE)).toBeNull()
    expect(classifyOutboundLink('   ', SITE)).toBeNull()
  })

  it('ignores internal navigation, absolute or relative', () => {
    expect(classifyOutboundLink('/projects', SITE)).toBeNull()
    expect(classifyOutboundLink('/en/blog/some-post', SITE)).toBeNull()
    expect(classifyOutboundLink(`https://${SITE}/graveyard`, SITE)).toBeNull()
  })

  it('treats www as the same host', () => {
    expect(classifyOutboundLink(`https://www.${SITE}/projects`, SITE)).toBeNull()
  })

  // Regression: comparing the URL's port-free hostname against a host that
  // carries a port reported every internal link on localhost as a demo click.
  it('stays silent on internal links when the host carries a port', () => {
    expect(classifyOutboundLink('/graveyard', 'localhost:3000')).toBeNull()
    expect(classifyOutboundLink('http://localhost:3000/projects', 'localhost:3000')).toBeNull()
  })

  it('still reports a genuinely different host when a port is in play', () => {
    const hit = classifyOutboundLink('https://github.com/writingdeveloper', 'localhost:3000')
    expect(hit?.name).toBe('code_click')
    expect(hit?.params.link_domain).toBe('github.com')
  })

  it('ignores protocols that are not http, https or mailto', () => {
    expect(classifyOutboundLink('tel:+1234567890', SITE)).toBeNull()
    expect(classifyOutboundLink('javascript:void(0)', SITE)).toBeNull()
  })

  it('counts a product subdomain as a demo click, not internal', () => {
    const hit = classifyOutboundLink('https://toolsmith.writingdeveloper.blog', SITE)
    expect(hit?.name).toBe('demo_click')
    expect(hit?.params.link_domain).toBe('toolsmith.writingdeveloper.blog')
  })

  it('classifies a Play Store listing', () => {
    const hit = classifyOutboundLink(
      'https://play.google.com/store/apps/details?id=com.soursea.coinrace',
      SITE,
    )
    expect(hit?.name).toBe('play_store_click')
    expect(hit?.params.link_domain).toBe('play.google.com')
  })

  it('classifies a source-code host', () => {
    expect(classifyOutboundLink('https://github.com/writingdeveloper/citefirst', SITE)?.name).toBe(
      'code_click',
    )
  })

  it('classifies any other external host as a demo click', () => {
    expect(classifyOutboundLink('https://argus-fusion.vercel.app', SITE)?.name).toBe('demo_click')
  })

  it('classifies mailto and keeps only the address domain', () => {
    const hit = classifyOutboundLink('mailto:someone@example.com?subject=Hi', SITE)
    expect(hit?.name).toBe('contact_click')
    expect(hit?.params.link_domain).toBe('example.com')
  })

  it('drops a malformed mailto with no address', () => {
    expect(classifyOutboundLink('mailto:', SITE)).toBeNull()
  })

  it('preserves the full URL so a report can tell projects apart', () => {
    const a = classifyOutboundLink('https://race.writingdeveloper.blog', SITE)
    const b = classifyOutboundLink('https://kindling.writingdeveloper.blog', SITE)
    expect(a?.params.link_url).not.toBe(b?.params.link_url)
  })

  // Regression: LinkedIn fell through to demo_click, so every footer click on
  // it inflated the demo metric. On a hire page it is a contact action.
  it('classifies LinkedIn as a contact click, not a demo click', () => {
    const hit = classifyOutboundLink('https://www.linkedin.com/in/sihyeonglee/', SITE)
    expect(hit?.name).toBe('contact_click')
    expect(hit?.params.link_domain).toBe('linkedin.com')
  })

  it('classifies LinkedIn without the www subdomain too', () => {
    expect(classifyOutboundLink('https://linkedin.com/in/sihyeonglee/', SITE)?.name).toBe(
      'contact_click',
    )
  })

  it('keeps mailto and LinkedIn separable by domain', () => {
    const mail = classifyOutboundLink('mailto:someone@example.com', SITE)
    const linked = classifyOutboundLink('https://www.linkedin.com/in/sihyeonglee/', SITE)
    expect(mail?.name).toBe(linked?.name)
    expect(mail?.params.link_domain).not.toBe(linked?.params.link_domain)
  })
})
