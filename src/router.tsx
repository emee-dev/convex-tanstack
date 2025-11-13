import { DefaultCatchBoundary } from '@/components/error-boundary'
import { NotFound } from '@/components/not-found'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
// import * as Sentry from '@sentry/tanstackstart-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { ConvexReactClient } from 'convex/react'
import { isDev } from './lib/utils'
import { routeTree } from './routeTree.gen'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL as string

if (!CONVEX_URL) {
  throw new Error('missing VITE_CONVEX_URL envar')
}

const convexClient = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
})

const convexQueryClient = new ConvexQueryClient(convexClient)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})

convexQueryClient.connect(queryClient)

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient, convexClient, convexQueryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => (
      <ConvexAuthProvider client={convexClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConvexAuthProvider>
    ),
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  })

  return router
}
