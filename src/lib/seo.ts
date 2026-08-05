import { SITE_URL, SITE_NAME } from './constants'

/** Safely serialize JSON-LD for embedding in <script> tags.
 *  Escapes `<` to prevent `</script>` injection (OWASP recommendation). */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Stored image paths are usually root-relative (`/images/...`), but fields
 *  like `coverImage` are Keystatic-editable and could hold an absolute URL
 *  (e.g. an external CDN). Every call site that turns a stored path into an
 *  absolute URL for JSON-LD/sitemap/OG output must go through this so they
 *  can't disagree on the rule and double-prefix `SITE_URL`. */
export function toAbsoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`
}

export function generateArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  dateModified,
  authorName,
  locale,
  tags,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: string
  dateModified?: string
  authorName: string
  locale?: string
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    // BlogPosting (a subtype of Article) is the precise type for blog content.
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished: publishedAt,
    dateModified: dateModified || publishedAt,
    ...(locale ? { inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US' } : {}),
    ...(tags?.length ? { keywords: tags.join(', ') } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: authorName,
      // Entity link so search/AI engines can connect the author across pages
      // (matches the Person URL used in the projects ItemList).
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function generateWebsiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      locale === 'ko'
        ? '개발 이야기, 기술 튜토리얼, 그리고 스타트업 여정'
        : 'Dev stories, tech tutorials, and startup journey',
    inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
    publisher: {
      '@type': 'Person',
      name: locale === 'ko' ? '이시형' : 'Si Hyeong Lee',
      url: `${SITE_URL}/about`,
    },
  }
}

export function generatePersonJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: locale === 'ko' ? '이시형' : 'Si Hyeong Lee',
      url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/about`,
      jobTitle: locale === 'ko' ? '개발자 & 창업가' : 'Developer & Entrepreneur',
      description:
        locale === 'ko'
          ? '개발자이자 창업가로서 기술로 문제를 해결하고 있습니다.'
          : 'As a developer and entrepreneur, I solve problems with technology.',
      knowsAbout: [
        'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Electron',
        'NestJS', 'Node.js', 'Supabase', 'PostgreSQL',
      ],
      sameAs: [
        'https://github.com/writingdeveloper',
        'https://www.linkedin.com/in/sihyeonglee/',
      ],
    },
  }
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** ItemList of the portfolio's projects, so search/AI engines can enumerate the
 *  body of work as discrete CreativeWorks (each authored by the site owner). */
export function generateProjectListJsonLd(
  projects: {
    name: string
    description: string
    url?: string
    techStack?: string[]
    playStore?: string
    appCategory?: string
    /** Absolute URL of a real screenshot of the project. */
    image?: string
  }[],
  locale: string,
) {
  const authorName = locale === 'ko' ? '이시형' : 'Si Hyeong Lee'
  const author = { '@type': 'Person', name: authorName, url: `${SITE_URL}/about` }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'ko' ? '프로젝트' : 'Projects',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => {
      const common = {
        name: project.name,
        description: project.description,
        ...(project.url ? { url: project.url } : {}),
        ...(project.techStack?.length ? { keywords: project.techStack.join(', ') } : {}),
        ...(project.image ? { image: project.image } : {}),
        author,
      }
      // Projects with a Play Store listing are typed as MobileApplication so
      // search/AI engines can treat them as installable Android apps (richer
      // than a generic CreativeWork). Web-only projects stay CreativeWork.
      const item = project.playStore
        ? {
            '@type': 'MobileApplication',
            ...common,
            operatingSystem: 'ANDROID',
            applicationCategory: project.appCategory ?? 'LifestyleApplication',
            installUrl: project.playStore,
            ...(project.image ? { screenshot: project.image } : {}),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : { '@type': 'CreativeWork', ...common }
      return { '@type': 'ListItem', position: index + 1, item }
    }),
  }
}

/**
 * Structured data for a single project's own page.
 *
 * The type is chosen from what the project actually is, because `screenshot`
 * is only valid on SoftwareApplication and its subtypes:
 *   - a Play Store listing  -> MobileApplication
 *   - a live site, no store -> WebApplication (still a SoftwareApplication,
 *                              so the screenshot is legal here too)
 *   - neither               -> CreativeWork, and no screenshot claim
 *
 * The list on /projects deliberately stays coarser (CreativeWork for anything
 * without a store listing); this is the page where being precise pays off.
 */
export function generateProjectJsonLd(
  project: {
    name: string
    description: string
    /** Canonical URL of this project's own page. */
    url: string
    techStack?: string[]
    website?: string
    github?: string
    playStore?: string
    appCategory?: string
    /** Absolute URL of a real screenshot. Never a generated image. */
    image?: string
  },
  locale: string,
) {
  const authorName = locale === 'ko' ? '이시형' : 'Si Hyeong Lee'
  const sameAs = [project.website, project.github, project.playStore].filter(Boolean) as string[]

  const common = {
    name: project.name,
    description: project.description,
    url: project.url,
    ...(project.techStack?.length ? { keywords: project.techStack.join(', ') } : {}),
    ...(project.image ? { image: project.image } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
    author: { '@type': 'Person', name: authorName, url: `${SITE_URL}/about` },
  }

  if (project.playStore) {
    return {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      ...common,
      operatingSystem: 'ANDROID',
      applicationCategory: project.appCategory ?? 'LifestyleApplication',
      installUrl: project.playStore,
      ...(project.image ? { screenshot: project.image } : {}),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }
  }

  if (project.website) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      ...common,
      applicationCategory: project.appCategory ?? 'WebApplication',
      browserRequirements: 'Requires JavaScript',
      ...(project.image ? { screenshot: project.image } : {}),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }
  }

  return { '@context': 'https://schema.org', '@type': 'CreativeWork', ...common }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
