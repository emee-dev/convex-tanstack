import { getFingerPrint } from '@/actions/client'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthDialog } from '@/components/auth-dialog'
import { CodeGenerator } from '@/components/code-generator'
import { Loader } from '@/components/loader'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RequestLayout } from '@/components/request-layout'
import { SearchDialog } from '@/components/search-dialog'
import { AnimatedThemeToggler } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import { Requests } from '@/lib/utils'
import { convexQuery } from '@convex-dev/react-query'
import * as Sentry from '@sentry/tanstackstart-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { ClientOnly, createFileRoute, Link } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    const browserId = await getFingerPrint()

    Sentry.setTag('browserId', browserId)

    return {
      browserId: String(browserId),
    }
  },
  ssr: false,
  pendingComponent: () => <Loader />,
  onError(_) {
    Sentry.setContext('home_page', { location: 'fingerprinting browser' })
  },
})

function App() {
  const { browserId } = Route.useLoaderData()
  const [selectedRequest, setSelectedRequest] = useState<Requests | null>(null)
  const { data } = useQuery(
    convexQuery(
      api.requests.getRecentRequests,
      browserId
        ? {
            browserId,
          }
        : 'skip',
    ),
  )
  const { data: metadata } = useQuery(
    convexQuery(api.requests.getUploadUrl, browserId ? {} : 'skip'),
  )

  const handleSelect = (item: any) => {
    setSelectedRequest(item)
  }

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRequest(data[0])
    }
  }, [data])

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '19rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        requests={data}
        selectedRequest={selectedRequest}
        handleSelect={handleSelect}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />

          <div className="ms-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <Link
              to="/docs/$"
              data-slot="button"
              data-pressed="true"
              className="text-primary relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-shadow outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-transparent hover:bg-accent data-pressed:bg-accent min-h-8 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] "
            >
              Docs
            </Link>

            <SearchDialog
              fingerprintId={browserId}
              handleSelect={handleSelect}
            />
            <Separator
              orientation="vertical"
              className="mr-1.5 data-[orientation=vertical]:h-5"
            />

            <Authenticated>
              <ProfileDropdown />
            </Authenticated>

            <Unauthenticated>
              <AuthDialog />
            </Unauthenticated>

            <Separator
              orientation="vertical"
              className="mr-1.5 data-[orientation=vertical]:h-5"
            />

            <AnimatedThemeToggler />
          </div>
        </header>
        {selectedRequest && (
          <div className="grid grid-cols-10 gap-4 p-4 pt-0">
            <div className="h-11 flex col-span-10">
              <ClientOnly fallback={<div>Loading...</div>}>
                <CopyFingerprint />
              </ClientOnly>

              <div className="ml-auto flex items-center gap-x-1.5">
                <CodeGenerator selectedRequest={selectedRequest} />
              </div>
            </div>

            <RequestLayout
              uploadUrl={metadata?.uploadUrl}
              data={selectedRequest}
            />
          </div>
        )}

        {!selectedRequest && (
          <div className="flex items-center justify-center w-full mx-auto pt-[25%] lg:pt-[15%]">
            <div className="ring ring-offset-2 dark:ring-offset-accent rounded-md ring-muted-foreground/50 dark:ring-accent-foreground/50 w-md p-3">
              <div className="mb-8 flex flex-col gap-y-1.5">
                <p>WEBHOOK URL</p>
                <p className="text-muted-foreground">
                  Send requests to your unique webhook URL
                </p>
              </div>

              <ClientOnly fallback={<div>Loading...</div>}>
                <CopyFingerprint />
              </ClientOnly>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

const CopyFingerprint = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['fingerprint'],
    queryFn: async () => {
      const protocol = location.protocol
      const host = location.host
      const browserId = await getFingerPrint()

      return `${protocol}//${host}/n/${browserId}`
    },
  })

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="flex w-full max-w-md items-center justify-between rounded-xl border bg-accent p-1.5 text-sm shadow-sm pl-2.5">
      <span className="truncate font-mono">{data}</span>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs transition hover:bg-muted cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" />
        </svg>

        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
