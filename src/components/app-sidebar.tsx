import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { color, Requests } from '@/lib/utils'
import { GalleryVerticalEnd } from 'lucide-react'
import * as React from 'react'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  requests: Requests[] | undefined
  selectedRequest: Requests | null
  handleSelect?: (item: Requests) => void
}
export function AppSidebar({
  selectedRequest,
  handleSelect,
  requests,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium font-sans">WEBHOOK.sh</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="w-full text-sm">
          <SidebarMenu className="flex w-full flex-col gap-1">
            {requests && requests.length > 0 ? (
              requests.map((item) => (
                <SidebarMenuItem
                  key={item._id}
                  onClick={() => handleSelect?.(item)}
                >
                  <span
                    className={`
            group grid w-full font-sans cursor-pointer grid-cols-[64px_1fr_20px] items-center
            gap-2 rounded-md px-4 py-2 text-sm transition-colors
            hover:bg-muted hover:text-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${
              selectedRequest?._id === item._id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-muted-foreground'
            }
          `}
                  >
                    <span
                      className={`font-semibold text-xs rounded-xs text-center uppercase tracking-wide w-12 ${color(item.method)}`}
                    >
                      {item.method}
                    </span>

                    <span className="truncate text-foreground/80">
                      {item.origin}
                    </span>

                    <span className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </span>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-muted-foreground select-none">
                <div className="relative mb-3">
                  <div className="absolute inset-0 animate-ping rounded-full bg-muted-foreground/30 size-6"></div>
                  <div className="relative flex items-center justify-center rounded-full bg-muted-foreground dark:bg-accent size-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="size-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.814-1.874 1.948-3.374L13.948 3.376a2.25 2.25 0 0 0-3.896 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                </div>

                <p className="text-sm font-medium">No requests yet</p>
                <p className="text-xs text-muted-foreground/70">
                  Waiting for incoming webhook requests...
                </p>
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
