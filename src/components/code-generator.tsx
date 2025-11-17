import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Requests } from '@/lib/utils'
import { useCompletion } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import { AiResponse } from './ai-response'
import { PromptInput } from './prompt-input'
import { Button } from './ui/button'
import { toast } from 'sonner'

type CodeGeneratorProps = {
  selectedRequest: Requests
}

export const CodeGenerator = (props: CodeGeneratorProps) => {
  const { completion, complete, error } = useCompletion({
    api: '/api/chat',
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  const suggestions = [
    'Generate integration code',
    'Write a webhook endpoint in TanStack start',
    'Create an Hono.js endpoint',
    'Verify the request using a HMAC utility ',
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Generate integration code</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-[500px] md:max-w-[700px] max-h-[90vh] min-h-[500px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Generate Integration Code</DialogTitle>
          <DialogDescription>Simple code snippet generation.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-md p-2 h-80 scrollbar-hide md:h-[380px] font-sans">
          {completion && completion.trim() !== '' ? (
            <AiResponse markdown={completion} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              AI generated code will appear here.
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <PromptInput
            complete={complete}
            suggestions={suggestions}
            request={props.selectedRequest}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
