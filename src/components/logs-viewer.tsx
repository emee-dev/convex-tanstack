import { Doc } from '@/convex/_generated/dataModel'
import { Separator } from './ui/separator'
import { Fragment } from 'react'

export type LogEntry = Doc<'scripts'>['logs'][number]

interface LogsViewerProps {
  logs: LogEntry[]
}

export function LogsViewer({ logs }: LogsViewerProps) {
  const sortedLogs = [...logs].reverse()

  return (
    <div className="mt-y-2">
      <div className="rounded-md bg-background overflow-y-auto max-h-64 font-sans text-sm">
        {sortedLogs.length === 0 ? (
          <div className="p-4 text-muted-foreground text-center">
            No logs yet. Run the script to see output.
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            {sortedLogs.map((log) => (
              <Fragment key={log.id}>
                <Separator orientation="horizontal" />
                <div
                  className={`flex gap-x-5 pb-1 ${
                    log.level === 'error'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'text-foreground/80'
                  } p-2 rounded`}
                >
                  <span className="text-muted-foreground shrink-0 w-20 self-start leading-snug">
                    {log.timestamp}
                  </span>

                  <span className="whitespace-pre-wrap wrap-break-word leading-snug">
                    {log.message}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
