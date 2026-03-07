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
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
