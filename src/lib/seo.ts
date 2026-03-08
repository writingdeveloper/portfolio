import { SITE_URL, SITE_NAME } from './constants'

/** Safely serialize JSON-LD for embedding in <script> tags.
 *  Escapes `<` to prevent `</script>` injection (OWASP recommendation). */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function generateArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  dateModified,
  authorName,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: string
  dateModified?: string
  authorName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished: publishedAt,
    dateModified: dateModified || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: authorName,
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
