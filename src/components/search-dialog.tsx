import { api } from '@/convex/_generated/api'
import { useDebounceSearch } from '@/hooks/use-debounced-search'
import { color, Requests } from '@/lib/utils'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Search, SquareTerminal } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'

type SearchDialogProps = {
  fingerprintId: string
  handleSelect: (item: Requests) => void
}

type KeyValue = Requests['meta'][number]

export const SearchDialog = ({
  fingerprintId,
  handleSelect,
}: SearchDialogProps) => {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const debouncedSearch = useDebounceSearch(query, 300)

  const { data, isLoading, error } = useQuery(
    convexQuery(
      api.search.searchRequests,
      debouncedSearch && fingerprintId
        ? {
            fingerprintId,
            searchQuery: debouncedSearch,
          }
        : 'skip',
    ),
  )

  const BreadCrumbs = (props: { data: string }) => {
    const tokens = props.data.match(/\/|{[^}]+}|[^/]+/g) ?? []

    return (
      <div className="flex items-center flex-1 min-w-0">
        {tokens.map((item, index) => {
          const key = `${item}-${index}`

          if (item === '/') {
            const stripped = item.replace('/', '')
            return (
              <div key={key} className="flex items-center shrink min-w-0">
                <ChevronRight className="mx-0.5 shrink-0 size-3 text-gray-500 dark:text-gray-400" />
                <div className="[&_mark]:bg-transparent [&_mark_b]:font-medium [&_mark_b]:text-md [&_mark_b]:text-primary dark:[&_mark_b]:text-primary-light [&amp;_span.font-medium]:text-primary dark:[&amp;_span.font-medium]:text-primary-light text-xs text-gray-500 dark:text-gray-400 truncate">
                  {stripped}
                </div>
              </div>
            )
          }

          return (
            <div key={key} className="flex items-center shrink-0">
              <div className="truncate [&_mark]:bg-transparent [&_mark_b]:font-medium [&_mark_b]:text-md [&_mark_b]:text-primary dark:[&_mark_b]:text-primary-light [&amp;_span.font-medium]:text-primary dark:[&amp;_span.font-medium]:text-primary-light text-xs text-gray-500 dark:text-gray-400 w-fit">
                {item}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Trigger */}
      <div
        className="mx-2 hidden w-full flex-1 md:flex md:w-auto md:flex-none"
        onClick={() => setSearchOpen(!searchOpen)}
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          className="relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-shadow outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-border bg-background shadow-xs not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] dark:bg-input/32 dark:not-in-data-[slot=group]:bg-clip-border dark:not-disabled:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/4%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/8%)] [:disabled,:active,[data-pressed]]:shadow-none [:hover,[data-pressed]]:bg-accent/50 dark:[:hover,[data-pressed]]:bg-input/64 min-h-8 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] hover:bg-accent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              d="M17 17L21 21"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <path
              d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>

          <div className="gap-1 sm:flex">
            <kbd className="pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3">
              Ctrl
            </kbd>
            <kbd className="pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3 aspect-square">
              K
            </kbd>
          </div>
        </button>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          className="max-w-88 md:max-w-2xl translate-y-1 top-10 p-1.5 gap-0 bg-accent border-none rounded-2xl sm:rounded-2xl dark:ring ring-muted-foreground/25"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Request search</DialogTitle>
            <DialogDescription>Search for relevant requests.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center px-3 py-1 border border-black gap-x-2 rounded-xl dark:ring ring-accent-foreground/30 dark:border-none">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={query}
              placeholder="Search..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
              name="search"
              onChange={(e) => setQuery(e.target.value)}
              className="p-0 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
            />
            {query && (
              <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 border rounded">
                ESC
              </kbd>
            )}
          </div>

          <div className="overflow-y-auto max-h-96 *:mt-3">
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Searching…
              </div>
            )}

            {!isLoading && error && (
              <div className="flex items-center justify-center py-6 text-sm text-red-500">
                {error.message}
              </div>
            )}

            {!isLoading &&
              !error &&
              data &&
              data.length === 0 &&
              debouncedSearch && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  No results found.
                </div>
              )}

            {!isLoading &&
              !error &&
              data &&
              data.length > 0 &&
              data.map((item) => {
                const size = item.meta.find(
                  (item) => item.key === 'size',
                ) as KeyValue
                const date = item.meta.find(
                  (item) => item.key === 'date',
                ) as KeyValue

                return (
                  <div
                    className="last:mb-2 group font-sans"
                    key={item._id}
                    role="option"
                    tabIndex={-1}
                    onClick={() => {
                      handleSelect(item)
                      setSearchOpen(false)
                    }}
                  >
                    <div className="cursor-pointer relative rounded-xl flex gap-3 px-2.5 py-2 items-center">
                      <SquareTerminal className="w-4 h-4 shrink-0 text-primary dark:text-primary-light" />
                      <div className="flex flex-col flex-1 min-w-0 gap-1">
                        <div className="flex items-center gap-1">
                          <BreadCrumbs
                            data={`${size.value} MB/${date.value}`}
                          />
                        </div>

                        <div className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
                          <div
                            className={`px-1 py-0 font-mono text-xs font-bold ${color(
                              item.method,
                            )}`}
                          >
                            {item.method}
                          </div>

                          <div className="truncate text-sm leading-[18px] font-medium text-gray-800 dark:text-gray-200 [&_mark]:bg-transparent [&_mark_b]:text-primary dark:[&_mark_b]:text-primary-light">
                            {item.origin}
                          </div>
                        </div>

                        {item.note && (
                          <p className="text-xs truncate w-full text-gray-500 [&_mark]:bg-transparent [&_mark_b]:text-primary dark:[&_mark_b]:text-primary-light">
                            {item.note}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-transparent group-hover:text-primary" />
                    </div>
                  </div>
                )
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
