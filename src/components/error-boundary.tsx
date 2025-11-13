import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import * as Sentry from '@sentry/tanstackstart-react'
import { useNavigate } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const isRoot = useMatch({
    strict: false,
    select: (state: any): boolean => state.id === rootRouteId,
  })

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <ErrorComponent error={error} />

        <button
          onClick={() => setShowDetails((v) => !v)}
          className="text-sm underline opacity-70 hover:opacity-100 transition"
        >
          {showDetails ? 'Hide error details' : 'Show error details'}
        </button>

        {showDetails && (
          <pre className="bg-gray-900 text-gray-200 text-xs p-3 rounded-md max-w-full overflow-auto whitespace-pre-wrap">
            {String(error?.stack || error)}
          </pre>
        )}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <Button size="sm" onClick={() => router.invalidate()}>
          {' '}
          Try Again
        </Button>

        {isRoot ? (
          <Link to="/">
            <Button size="sm">Home</Button>
          </Link>
        ) : (
          <Link
            to="/"
            onClick={(e: any) => {
              e.preventDefault()
              navigate({ to: '/' })
            }}
          >
            <Button size="sm">Go Back</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
