import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-7xl font-bold text-stone-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">Page not found</h2>
      <p className="text-stone-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-4 py-2 bg-orange-700 text-white text-sm font-medium rounded-md hover:bg-orange-800">
        Go home
      </Link>
    </div>
  )
}
