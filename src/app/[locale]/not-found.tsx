import { Link } from '@/i18n/navigation'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-400">Page not found.</p>
      <Link
        href="/"
        className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
