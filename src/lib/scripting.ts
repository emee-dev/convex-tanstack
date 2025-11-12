import vm from 'node:vm'
import { z } from 'zod'
import { timestamp, uniqueId } from './utils'

function formatValue(value: any): string {
  const type = typeof value

  if (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    value === null
  ) {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    // fallback
    return '[Object Object]'
  }
}

function formatArgs(args: any[]): string {
  return args.map(formatValue).join(' ')
}

function formatHeaders(requestCtx: any): Record<string, string> {
  let _temp = {} as Record<string, string>

  for (const item of requestCtx.headers) {
    _temp[item.key] = item.value
  }

  return _temp
}

type Logs = {
  id: string
  level: 'log' | 'error'
  message: string
  timestamp: string
}

type Job = {
  id: string
  code: string
}

type Result = {
  success: boolean
  result?: any
  logs: Logs[]
  error?: string
}

export async function runCode(job: Job, requestCtx: any): Promise<Result> {
  let evalLogs: Logs[] = []

  const ctx = {
    z,
    fetch,
    request: { ...requestCtx, headers: formatHeaders(requestCtx) },
    console: {
      log: (...values: any[]) => {
        evalLogs.push({
          id: uniqueId(),
          level: 'log',
          message: formatArgs(values),
          timestamp: timestamp(),
        })
      },
      error: (...values: any[]) => {
        evalLogs.push({
          id: uniqueId(),
          level: 'error',
          message: formatArgs(values),
          timestamp: timestamp(),
        })
      },
    },
  }

  vm.createContext(ctx)
  evalLogs = [] // clear logs for each run

  try {
    const wrapped = `
      (async () => {
        try {
          ${job.code}
        } catch (err) {
          // console.error(err?.message || err);
          console.error(err?.stack || err?.message || err);
        }
      })()
    `

    const result = await vm.runInContext(wrapped, ctx)
    return { success: true, logs: evalLogs, result }
  } catch (err: any) {
    return { success: false, logs: evalLogs, error: err.message }
  }
}
