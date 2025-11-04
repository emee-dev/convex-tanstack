import { DefaultCatchBoundary } from '@/components/error-boundary'
import { NotFound } from '@/components/not-found'
import * as Sentry from '@sentry/tanstackstart-react'
import { createRouter } from '@tanstack/react-router'
import { isDeployed } from './lib/utils'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  })

  if (!router.isServer && isDeployed) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.NODE_ENV,
      sendDefaultPii: true,
      integrations: [],
    })
  }

  return router
}
