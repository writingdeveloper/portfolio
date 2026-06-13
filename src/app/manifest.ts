import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WritingDeveloper',
    short_name: 'WD',
    description: 'Dev stories, tech tutorials, and startup journey',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#030712',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
