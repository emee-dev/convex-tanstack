import {
  PromptInput as LocalPromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Requests } from '@/lib/utils'
import { useCompletion } from '@ai-sdk/react'
import { Activity, useRef, useState } from 'react'
import { ReactTyped } from 'react-typed'

const SUBMITTING_TIMEOUT = 200
const STREAMING_TIMEOUT = 2000

type Complete = ReturnType<typeof useCompletion>
type PromptInputProps = {
  request: Requests
  suggestions: string[]
  complete: Complete['complete']
}
export const PromptInput = ({
  complete,
  suggestions,
  request,
}: PromptInputProps) => {
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isAnimating, setIsAnimating] = useState(true)

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    setStatus('submitted')

    complete?.(message.text, { body: { request } })

    setTimeout(() => {
      setStatus('streaming')
    }, SUBMITTING_TIMEOUT)

    setTimeout(() => {
      setStatus('ready')
    }, STREAMING_TIMEOUT)
  }

  return (
    <PromptInputProvider>
      <LocalPromptInput globalDrop multiple onSubmit={handleSubmit}>
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>
        <PromptInputBody className="h-10">
          <Activity mode={isAnimating ? 'hidden' : 'visible'}>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="How do I help you?"
            />
          </Activity>

          <Activity mode={isAnimating ? 'visible' : 'hidden'}>
            <div
              className="w-full px-2 text-muted-foreground font-sans text-sm flex items-start justify-start resize-none rounded-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
              onClick={() => setIsAnimating(!isAnimating)}
            >
              <ReactTyped
                strings={suggestions}
                typeSpeed={40}
                backSpeed={20}
                backDelay={1200}
                loop
              />
            </div>
          </Activity>
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </LocalPromptInput>
    </PromptInputProvider>
  )
}
