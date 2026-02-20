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
    image: imageUrl,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Person',
      name: 'WritingDeveloper',
    },
  }
}

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Si Hyeong Lee',
    url: 'https://writingdeveloper.blog',
    jobTitle: 'Developer & Entrepreneur',
    sameAs: [
      'https://github.com/writingdeveloper',
      'https://linkedin.com/in/writingdeveloper',
    ],
  }
}
