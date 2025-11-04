import vm from 'node:vm'
import { z } from 'zod'

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
    return JSON.stringify(value, null, 2)
  } catch {
    // fallback for circular or unserializable values
    return '[Unserializable Object]'
  }
}

function formatArgs(args: any[]): string {
  return args.map(formatValue).join(' ')
}

type Logs = { level: 'log' | 'error'; message: string }

export async function runCode(code: string): Promise<{
  success: boolean
  result?: any
  logs: Logs[]
  error?: string
}> {
  const evalLogs: Logs[] = []

  const ctx = {
    z,
    console: {
      log: (...values: any[]) => {
        evalLogs.push({
          level: 'log',
          message: formatArgs(values),
        })
      },
      error: (...values: any[]) => {
        evalLogs.push({
          level: 'error',
          message: formatArgs(values),
        })
      },
    },
  }

  vm.createContext(ctx)
  evalLogs.length = 0 // clear logs for each run

  try {
    const wrapped = `
      (async () => {
        try {
          ${code}
        } catch (err) {
          console.error(err?.message || err);
        }
      })()
    `

    const result = await vm.runInContext(wrapped, ctx)
    return { success: true, logs: evalLogs, result }
  } catch (err: any) {
    return { success: false, logs: evalLogs, error: err.message }
  }
}
