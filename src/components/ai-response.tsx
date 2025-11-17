import { Streamdown } from 'streamdown'
import type { BundledTheme } from 'shiki'
const themes = ['github-light-default', 'github-dark'] as [
  BundledTheme,
  BundledTheme,
]

export const AiResponse = ({ markdown }: { markdown: string }) => {
  return (
    <Streamdown shikiTheme={themes} controls={{ table: false }}>
      {markdown}
    </Streamdown>
  )
}
