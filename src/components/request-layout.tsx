import { editNote, evalJS } from '@/actions/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Requests } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDownIcon,
  Copy,
  FileText,
  Info,
  Loader2,
  Pencil,
  Play,
  TerminalSquare,
  Trash2,
  Zap,
} from 'lucide-react'
import {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from 'react'
import { useTheme } from 'tanstack-theme-kit'
import { CodeEditor } from './code-editor'
import { Snippet } from './code-snippet'
import { LogEntry, LogsViewer } from './logs-viewer'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

type ItemKeys = 'meta' | 'request_body' | 'scripts' | 'logs'

type AccordionItemData = {
  id: ItemKeys
  title: string
  icon?: LucideIcon
  content: ReactNode
  header?: ReactNode
}

type RequestLayoutProps = { data: Requests }

const code = `console.log('Hello from the script!')
console.log('Request data:', { example: true })`

export function RequestLayout({ data }: RequestLayoutProps) {
  const { theme } = useTheme()
  const [value, setValue] = useState(code)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [openItems, setOpenItems] = useState<ItemKeys[]>([
    'meta',
    'request_body',
    'scripts',
    'logs',
  ])

  const { isPending, mutate } = useMutation({
    mutationKey: ['evaluate_script', data._id],
    mutationFn: async (source: string) =>
      await evalJS({
        data: {
          job: { id: data._id, code: source },
          requestCtx: data,
        },
      }),
    onSuccess(result) {
      setLogs((p) => [...p, ...result.logs])
    },
  })

  const onClear = () => {
    setLogs([])
  }

  const onExecute = async (source: string) => {
    mutate(source)
  }

  const items: AccordionItemData[] = [
    {
      id: 'meta',
      title: 'Request details',
      icon: Info,
      content: <RequestDetailsTable data={data} />,
    },
    {
      id: 'request_body',
      title: 'Request body',
      icon: FileText,
      content: (
        <div className="flex h-full flex-col bg-accent border-input border gap-0  px-1.5 pb-1.5 rounded-xl">
          <Tabs className="gap-0" value="code">
            <TabsList className="text-foreground w-full rounded-none bg-transparent px-1.5 h-10 flex items-center">
              <div className="flex gap-1">
                <TabsTrigger
                  value="code"
                  className="hover:bg-muted-foreground/15 px-1.5 py-1 text-xs hover:text-foreground data-[state=active]:after:bg-muted-foreground data-[state=active]:hover:bg-muted-foreground/15 relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Raw
                </TabsTrigger>
              </div>

              <button
                type="button"
                // onClick={handleCopy}
                className="flex items-center ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="size-4" />
              </button>
            </TabsList>

            <TabsContent
              value="code"
              className="h-44 max-h-48 w-full relative overflow-scroll scrollbar-hide border-input border rounded-xl"
            >
              <div className="text-sm">
                <Snippet
                  code={data.requestBody || 'No defined request body'}
                  language={data.requestBody ? 'json' : 'text'}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
    {
      id: 'scripts',
      title: 'On-request script',
      icon: Zap,
      // Scripting is available to authenticated users
      // Runs for all requests from this origin
      header: (
        <div className="flex gap-x-1.5 items-center">
          <div
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 px-3 has-[>svg]:px-2.5 cursor-pointer text-primary underline-offset-4 hover:underline"
            onClick={() => onExecute(value)}
          >
            {isPending ? 'Wait...' : <Play className="h-3.5 w-3.5" />}
          </div>
          <ChevronDownIcon
            size={16}
            className="pointer-events-none shrink-0 opacity-60 transition-transform duration-200"
            aria-hidden="true"
          />
        </div>
      ),
      content: <CodeEditor theme={theme} value={value} onChange={setValue} />,
    },
    {
      id: 'logs',
      title: 'Logs',
      icon: TerminalSquare,
      header: (
        <div className="flex gap-x-1.5 items-center">
          <div
            className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={onClear}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </div>

          <ChevronDownIcon
            size={16}
            className="pointer-events-none shrink-0 opacity-60 transition-transform duration-200"
            aria-hidden="true"
          />
        </div>
      ),
      content: (
        <div className="space-y-3">
          <LogsViewer logs={logs} />
        </div>
      ),
    },
  ]

  return (
    <div
      className={`space-y-4 col-span-10 ring ring-offset-2 rounded-md ring-muted-foreground/50 dark:ring-offset-accent dark:ring-accent-foreground/50`}
    >
      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={(v: ItemKeys[]) => {
          // Bug: temporary fix that allows the script accordion to not collapse on
          // script eval
          if (!v.includes('scripts')) {
            setOpenItems((p) => [...p, 'scripts'])
          } else {
            setOpenItems(v)
          }
        }}
        className="w-full -space-y-px"
      >
        {items.map((item) => {
          const Icon = item.icon

          return (
            <AccordionItem
              value={item.id}
              key={item.id}
              className="relative border bg-background px-4 py-1 outline-none first:rounded-t-md last:rounded-b-md last:border-b has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
            >
              <AccordionTrigger
                className="flex w-full items-center justify-between rounded-md py-2 text-[15px] leading-6 outline-none hover:no-underline focus-visible:ring-0 font-sans"
                extraParts={item?.header}
              >
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.title}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="text-muted-foreground relative w-full max-w-full overflow-hidden font-sans">
                <div className="w-full max-w-full overflow-x-auto">
                  {item.content}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

type Props = { data: Requests }

function RequestDetailsTable(props: Props) {
  const [isEditing, setEditing] = useState(false)
  const [noteValue, setNoteValue] = useState<string>(props.data.note || '')
  const { isPending, mutate } = useMutation({
    mutationKey: ['edit_note'],
    mutationFn: async ({ note, id }: { note: string; id: string }) => {
      await editNote({ data: { note, requestId: id } })
    },
    onSuccess: () => {
      setNoteValue(props.data.note || '')
      setEditing(false)
    },
    onError(error) {
      console.log('Error: ', error.message)
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutate({ note: noteValue, id: props.data._id })
  }

  const formattedRequest = useMemo(() => formatRequest(props), [props])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-sm">
      <div>
        <table className="w-full border-collapse">
          <tbody>
            {formattedRequest.map(({ key, value, isMethod }) => {
              const isNote = key === 'note'

              if (isMethod) {
                return (
                  <tr key={key} className="border-b last:border-none">
                    <td className="py-2 pr-4 font-medium text-muted-foreground capitalize w-20">
                      {key}
                    </td>

                    <td className="py-2 text-foreground break-all">{value}</td>
                  </tr>
                )
              }
              if (isNote) {
                return (
                  <tr key={key} className="border-b last:border-none">
                    <td className="py-2 pr-4 font-medium text-muted-foreground capitalize w-20">
                      {key}
                    </td>

                    <td className="py-2 text-foreground break-all">
                      <Note
                        isEditing={isEditing}
                        value={value}
                        handleSubmit={handleSubmit}
                        setEditing={setEditing}
                        isPending={isPending}
                        noteValue={noteValue}
                        setNoteValue={setNoteValue}
                      />
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={key} className="border-b last:border-none">
                  <td className="py-2 pr-4 font-medium text-muted-foreground capitalize w-20">
                    {key}
                  </td>

                  <td className="py-2 text-foreground break-all">
                    {value || <span className="text-sm">NULL</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div>
        <table className="w-full border-collapse">
          <tbody>
            {props.data.headers.map(({ key, value }) => (
              <tr key={key} className="border-b last:border-none">
                <td className="py-2 pr-4 font-medium text-muted-foreground break-all w-44">
                  {key}
                </td>
                <td className="py-2 text-foreground break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type NoteProps = {
  value: string
  isEditing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  noteValue: string
  isPending: boolean
  setNoteValue: Dispatch<SetStateAction<string>>
}

const Note = ({
  value,
  setEditing,
  isEditing,
  handleSubmit,
  noteValue,
  isPending,
  setNoteValue,
}: NoteProps) => {
  return (
    <>
      {isEditing && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="w-full border rounded p-2 bg-background"
            defaultValue={value}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
          />

          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              variant="link"
              size="sm"
              className="flex items-center gap-0.5 text-sm text-blue-600x hover:underline"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Save Note'
              )}
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => setEditing(!isEditing)}
              className="flex items-center gap-0.5 text-sm text-blue-600x hover:underline"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className="flex items-center justify-between gap-2">
          {value}
          <Button
            variant="link"
            size="sm"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil size={15} />
            Add note
          </Button>
        </div>
      )}
    </>
  )
}

export type MetaItem = {
  key: string
  value: any
  isMethod?: boolean
}

function sortMeta(meta: MetaItem[]): MetaItem[] {
  const order: Record<string, number> = {
    method: 1, // represented by isMethod
    size: 2,
    date: 3,
    note: 4,
  }

  return meta.slice().sort((a: MetaItem, b: MetaItem) => {
    const aRank = a.isMethod ? 1 : (order[a.key] ?? Infinity)
    const bRank = b.isMethod ? 1 : (order[b.key] ?? Infinity)
    return aRank - bRank
  })
}

function formatRequest(props: { data: { meta: MetaItem[] } }) {
  const method = props.data.meta.find((i) => i.key === 'method')
  const url = props.data.meta.find((i) => i.key === 'url')

  const filtered = props.data.meta.filter(
    (item) => !['url', 'method'].includes(item.key),
  )

  const finalItems: MetaItem[] = [
    ...filtered,
    { key: method?.value ?? 'method', value: url?.value, isMethod: true },
  ]

  return sortMeta(finalItems)
}
