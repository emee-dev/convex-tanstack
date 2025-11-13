import { Toaster } from '@/components/ui/sonner'
import { authClient } from '@/lib/auth-client'
import appCss from '@/styles.css?url'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import {
  fetchSession,
  getCookieName,
} from '@convex-dev/better-auth/react-start'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'
import { ConvexReactClient } from 'convex/react'
import { RootProvider as FumaDocsProvider } from 'fumadocs-ui/provider/tanstack'
import { ThemeProvider } from 'tanstack-theme-kit'

const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { createAuth } = await import('../../convex/auth')
  const { session } = await fetchSession(getRequest())
  const sessionCookieName = getCookieName(createAuth)
  const token = getCookie(sessionCookieName)
  return {
    userId: session?.user.id,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
      // {
      //   httpEquiv: 'Content-Security-Policy',
      //   // TODO check if it is safe to do so.
      //   content: [
      //     "default-src 'self'",
      //     "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
      //     "font-src 'self' https://fonts.gstatic.com",
      //     "connect-src 'self' http://localhost:* https://*.convex.cloud ws://localhost:* wss://*.convex.cloud",
      //   ].join('; '),
      // },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    const { userId, token } = await fetchAuth()

    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }
    return { userId, token }
  },
  shellComponent: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })

  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`antialiased`} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class">
          <FumaDocsProvider>
            {children}

            <Toaster />
          </FumaDocsProvider>
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
