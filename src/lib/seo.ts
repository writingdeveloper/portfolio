import { SITE_URL } from './constants'

export function generateArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  authorName,
}: {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: string
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
    dateModified: publishedAt,
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
      name: 'WritingDeveloper',
      url: SITE_URL,
    },
  }
}
