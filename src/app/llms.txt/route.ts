import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import projectsData from '../../../content/projects.json'
import type { Project } from '@/types/content'

// Revalidate every hour
export const revalidate = 3600

// Link policy (mirrors the portfolio card policy): private projects expose only
// their live demo (never the code repo); public projects link their GitHub when
// they have no separate site; projects with neither stay link-free.
function projectLink(p: Project): string | null {
  if (p.website) return p.website
  if (!p.private && p.github) return p.github
  return null
}

// llms.txt favors one concise line per item, so summarize each project with the
// first sentence of its English description.
function firstSentence(text: string): string {
  const trimmed = text.trim()
  const end = trimmed.indexOf('. ')
  return end === -1 ? trimmed : trimmed.slice(0, end + 1)
}

export async function GET() {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const projectLines = (projectsData.projects as Project[])
    .map((p) => {
      const link = projectLink(p)
      const label = link ? `[${p.name}](${link})` : p.name
      return `- ${label}: ${firstSentence(p.descriptionEn)}`
    })
    .join('\n')

  const content = `# WritingDeveloper

> Personal blog and portfolio by Si Hyeong Lee (이시형) — a solo full-stack developer and entrepreneur who designs, builds, and ships products end to end.
> Dev stories, tech tutorials, and the startup journey behind the projects below.

## About

- [About (Korean)](${SITE_URL}/about): Developer and entrepreneur building products with technology.
- [About (English)](${SITE_URL}/en/about): Developer and entrepreneur building products with technology.

## Blog Posts (Korean)

${koPosts.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}`).join('\n')}

## Blog Posts (English)

${enPosts.map((post) => `- [${post.title}](${SITE_URL}/en/blog/${post.slug}): ${post.excerpt}`).join('\n')}

## Projects

${projectLines}

## Technical Stack

React, Next.js, TypeScript, Tailwind CSS, Three.js / React Three Fiber, NestJS, Node.js, Python, FastAPI, Electron, Expo / React Native, PostgreSQL, Prisma, Supabase, Stripe, Docker

## Links

- Website: ${SITE_URL}
- RSS Feed: ${SITE_URL}/feed.xml
- Sitemap: ${SITE_URL}/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
