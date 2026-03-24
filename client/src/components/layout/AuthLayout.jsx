import { Outlet, Link } from 'react-router-dom'
import { Database } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-orange-700 text-lg">
          <Database size={22} />
          OpenData Africa
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Outlet />
      </div>
    </div>
  )
}
