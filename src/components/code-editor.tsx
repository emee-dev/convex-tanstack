import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorState } from '@codemirror/state'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { EditorView, basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'

interface CodeEditorProps {
  theme?: 'light' | 'dark'
  value?: string
  onChange?: (src: string) => void
}

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
        javascript(),
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
