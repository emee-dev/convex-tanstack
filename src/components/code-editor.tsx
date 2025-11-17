import { autocompletion } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorState } from '@codemirror/state'
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import {
  tsAutocomplete,
  tsHover,
  tsLinter,
  tsSync,
} from '@valtown/codemirror-ts'
import { EditorView, basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'
import ts, {
  CompilerOptions,
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript'

interface CodeEditorProps {
  theme?: 'light' | 'dark'
  value?: string
  onChange?: (src: string) => void
}

const fsMap = await createDefaultMapFromCDN(
  { target: ts.ScriptTarget.ES2022 },
  '3.7.3',
  true,
  ts,
)

fsMap.set(
  '/global.d.ts',
  `declare global {

type UploadJsonAsBlobReturn = {
  storageId: string
}

type FirecrawlMetadata = {
  'msapplication-config'?: string
  language?: string
  'next-size-adjust'?: string
  'og:type'?: string
  'twitter:image:width'?: string
  'msapplication-TileColor'?: string
  'og:title'?: string
  charset?: string
  description?: string
  'apple-mobile-web-app-title'?: string
  ogDescription?: string
  'twitter:title'?: string
  'twitter:description'?: string
  'twitter:image:height'?: string
  'application-name'?: string
  ogTitle?: string
  ogUrl?: string
  'og:image'?: string
  'og:url'?: string
  'twitter:card'?: string
  'twitter:image'?: string
  canonical?: string
  ogImage?: string
  'og:site_name'?: string
  'og:image:width'?: string
  'og:image:height'?: string
  'og:description'?: string
  title?: string
  viewport?: string
  generator?: string
  favicon?: string
  scrapeId?: string
  sourceURL?: string
  url?: string
  statusCode?: number
  contentType?: string
  proxyUsed?: string
  cacheState?: string
  indexId?: string
  creditsUsed?: number

  // Allow for any extra unknown keys (in case Firecrawl adds more)
  [key: string]: any
}

type ScreenShotUrlArgs = {
  fullPage: boolean
  width: number
  height: number
  quality: number
}

type ScrapeUrlArgs = { prompt?: string; schema?: any }

type ScrapeUrlReturn = {
  success: boolean
  data: any
  metadata: FirecrawlMetadata
}

type ScreenShotUrlReturn = { success: boolean; screenshot: string }

declare function $scrapeUrl(url: string, opts?: ScrapeUrlArgs): Promise<ScrapeUrlReturn>

declare function $screenShotUrl(url: string, opts?: ScreenShotUrlArgs): Promise<ScreenShotUrlReturn>

declare function $set(key: string, value: string): Promise<boolean>

declare function $get(key: string, value: string ): Promise<string | number | boolean | null>

declare function $setFile(fileName: string, storageId: string ): Promise<boolean>

declare function $getFile(fileName: string): Promise<string | null>

declare function $uploadJsonAsBlob(content: string): Promise<UploadJsonAsBlobReturn>

declare function $json<TData>(payload: TData, init?: ResponseInit): Response

declare function $text(payload: string, init?: ResponseInit): Response

}

export {};
`,
)

const path = 'index.mts'
const system = createSystem(fsMap)
const compilerOpts: CompilerOptions = {
  declaration: true,
  module: ModuleKind.NodeNext,
  target: ScriptTarget.ES2022,
  moduleResolution: ModuleResolutionKind.NodeNext,
  allowSyntheticDefaultImports: true,
  moduleDetection: ModuleDetectionKind.Force,
}

const env = createVirtualTypeScriptEnvironment(
  system,
  [...fsMap.keys()],
  ts,
  compilerOpts,
)

export function CodeEditor({
  value = '',
  theme = 'dark',
  onChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<EditorView | null>(null)
  const themeCompartment = useRef(new Compartment())

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        javascript({
          typescript: true,
        }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            const src = update.state.doc.toString()
            onChange(src)
          }
        }),
        themeCompartment.current.of(
          theme === 'dark' ? vscodeDark : vscodeLight,
        ),

        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto', minHeight: '5rem' },
          '.cm-activeLine': { backgroundColor: 'transparent !important' },
          '&.cm-editor.cm-focused': {
            outline: 'none',
          },
          '.cm-line': { fontFamily: 'var(--font-mono)' },
          '.cm-content': { fontFamily: 'var(--font-mono)', fontSize: '13px' },
          '.cm-gutters': {
            border: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          },
        }),

        tsSync({ env, path }),
        tsLinter({ env, path }),
        autocompletion({
          override: [tsAutocomplete({ env, path })],
        }),
        tsHover({
          env,
          path,
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    editorRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current) return
    const current = editorRef.current.state.doc.toString()

    if (current !== value) {
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
      })
    }
  }, [value])

  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.dispatch({
      effects: themeCompartment.current.reconfigure(
        theme === 'dark' ? vscodeDark : vscodeLight,
      ),
    })
  }, [theme])

  return (
    <div className="space-y-3">
      <div className="border rounded-md overflow-hidden bg-background h-fit max-h-38">
        <div
          ref={containerRef}
          className="font-mono text-sm h-full min-h-20 max-h-38 overflow-auto"
        />
      </div>
    </div>
  )
}
