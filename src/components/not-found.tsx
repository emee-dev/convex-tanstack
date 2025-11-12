import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'

export function NotFound({ children }: { children?: any }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="space-y-6">
        <h1 className="text-7xl font-extrabold text-emerald-500">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Oops! Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {children ||
              'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate({ to: '/' })}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md font-semibold transition-all"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>

      <footer className="mt-10 text-xs text-gray-500 dark:text-gray-500">
        <p>© {new Date().getFullYear()} — All rights reserved</p>
      </footer>
    </div>
  )
}
