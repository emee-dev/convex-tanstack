import { cn } from '@/lib/utils'
import { ShikiHighlighter, Language as ShikiLanguage } from 'react-shiki'

type SnippetProps = {
  code: string
  className?: string
  language?: ShikiLanguage
}

export function Snippet(props: SnippetProps) {
  return (
    <ShikiHighlighter
      language={props.language || 'cURL'}
      theme={{ light: 'github-light-default', dark: 'catppuccin-latte' }}
      showLanguage={false}
      className={cn(props.className, 'h-full text-xs leading-[1.35rem]')}
      defaultColor="light-dark()"
    >
      {props.code.trim()}
    </ShikiHighlighter>
  )
}
