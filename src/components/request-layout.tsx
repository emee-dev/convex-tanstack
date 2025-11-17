import { editNote, evalJS } from '@/actions/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import { Requests } from '@/lib/utils'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import prettify from 'js-beautify'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDownIcon,
  Copy,
  Database,
  FileText,
  Info,
  Loader2,
  Pencil,
  Play,
  Save,
  Sparkles,
  TerminalSquare,
  Trash2,
  Zap,
} from 'lucide-react'
import {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTheme } from 'tanstack-theme-kit'
import { CodeEditor } from './code-editor'
import { Snippet } from './code-snippet'
import { DataStoreDialog } from './data-store-dialog'
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

type RequestLayoutProps = { data: Requests; uploadUrl: string | undefined }

export function RequestLayout({ uploadUrl, data }: RequestLayoutProps) {
  const { theme } = useTheme()
  const [value, setValue] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [openItems, setOpenItems] = useState<ItemKeys[]>([
    'meta',
    'request_body',
    'scripts',
    'logs',
  ])

  const { data: script } = useQuery(
    convexQuery(
      api.scripting.getScript,
      data
        ? {
            fingerprintId: data.fingerprintId,
            webhookOrigin: data.origin,
          }
        : 'skip',
    ),
  )

  const { isPending, mutate } = useMutation({
    mutationKey: ['evaluate_script', data._id],
    mutationFn: async (source: string) =>
      await evalJS({
        data: {
          script: { ctx: 'client-side', code: source },
          requestCtx: {
            bodyType: data.bodyType,
            note: data.note,
            fingerprintId: data.fingerprintId,
            headers: data.headers,
            meta: data.meta,
            method: data.method,
            origin: data.origin,
            requestBody: data.requestBody,
            shouldPersist: data.shouldPersist,
            query: data.query,
            storageId: data.storageId,
          },
          webhookCtx: {
            fingerprintId: data.fingerprintId,
            uploadUrl: uploadUrl || '',
            webhookOrigin: data.origin,
          },
        },
      }),
    onSuccess(result) {
      setLogs((p) => [...p, ...result.logs])
    },
  })

  const { mutate: createScript, isPending: isCreatingScript } = useMutation({
    mutationFn: useConvexMutation(api.scripting.createScript),
  })

  const { mutate: saveScript, isPending: isSavingScript } = useMutation({
    mutationFn: useConvexMutation(api.scripting.editSource),
  })

  const onClear = () => {
    setLogs([])
  }

  const onExecute = async (source: string) => {
    mutate(source)
  }

  const onSave = async () => {
    if (!script) return
    if (isSavingScript) return

    saveScript({
      source: value,
      scriptId: script._id,
    })
  }

  const onFormat = () => {
    const result = prettify(value, {
      indent_size: 2,
      indent_char: ' ',
      indent_with_tabs: false,

      end_with_newline: true,

      // Formatting behavior
      preserve_newlines: true,
      max_preserve_newlines: 2,
      space_in_empty_paren: false,
      break_chained_methods: false,

      // Object & array formatting
      keep_array_indentation: false,
      comma_first: false,

      // Line wrapping
      wrap_line_length: 80,

      // Quotes & semicolons
      unescape_strings: false,

      // Spacing rules
      space_before_conditional: true,
      space_after_anon_function: true,
      space_in_paren: false,
      jslint_happy: false,

      // JS-specific
      e4x: false,
      operator_position: 'before-newline',
    })

    setValue(result)
  }

  useEffect(() => {
    if (script) {
      setValue(script.source)
    }
  }, [script])

  const items: AccordionItemData[] = [
    {
      id: 'meta',
      title: 'Request details',
      icon: Info,
      content: <RequestMeta data={data} />,
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
      header: script && (
        <EditorActions
          data={data}
          isPending={isPending}
          isSavingScript={isSavingScript}
          onSave={onSave}
          onExecute={onExecute}
          onFormat={onFormat}
          script={script}
          value={value}
        />
      ),
      content: (
        <>
          {script && (
            <CodeEditor theme={theme} value={value} onChange={setValue} />
          )}

          {!script && (
            <div className="space-y-3">
              <div className="border border-dashed flex flex-col items-center justify-center rounded-md bg-muted/30 h-40 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You don't have a script yet
                </p>
                <Button
                  disabled={isCreatingScript}
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    createScript({
                      webhookOrigin: data.origin,
                      fingerprintId: data.fingerprintId,
                      source:
                        "async function onRequest() { \n  console.log('Your scripts go here!')\n}",
                    })
                  }
                >
                  {isCreatingScript ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />{' '}
                      Loading...
                    </>
                  ) : (
                    'Create Script'
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      ),
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
                hideChevron
                asChild
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

                <div>{item?.header}</div>
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

type EditorActionsProps = {
  value: string
  onExecute: (code: string) => void
  onFormat: () => void
  onSave: () => void
  data: any
  script: any
  isPending: boolean
  isSavingScript: boolean
}

export function EditorActions({
  value,
  onExecute,
  onFormat,
  onSave,
  data,
  script,
  isPending,
  isSavingScript,
}: EditorActionsProps) {
  const [show, setShow] = useState(false)
  const baseBtn =
    'inline-flex items-center justify-center h-8 w-8 rounded-md text-primary ' +
    'hover:bg-muted transition-colors cursor-pointer'

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={baseBtn} onClick={() => onExecute(value)}>
            {isPending ? (
              <span className="text-xs">...</span>
            ) : (
              <Play className="size-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>Run</TooltipContent>
      </Tooltip>

      <DataStoreDialog
        fingerprintId={data.fingerprintId}
        webhookOrigin={data.origin}
        fileData={script?.file || []}
        kvData={script?.kv || []}
        show={show}
        setShow={setShow}
        trigger={
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={baseBtn} onClick={() => setShow(!show)}>
                <Database className="size-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>View Data</TooltipContent>
          </Tooltip>
        }
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <div className={baseBtn} onClick={onFormat}>
            <Sparkles className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>Format</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className={baseBtn} onClick={onSave}>
            {isSavingScript ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{isSavingScript ? 'Saving' : 'Save'}</TooltipContent>
      </Tooltip>
    </div>
  )
}

type RequestMetaProps = { data: Requests }

function RequestMeta(props: RequestMetaProps) {
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
    method: 1,
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
