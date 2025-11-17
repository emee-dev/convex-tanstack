import { api } from '@/convex/_generated/api'
import { json } from '@tanstack/react-start'
import axios from 'axios'
import vm from 'node:vm'
import { z } from 'zod/v4'
import { fetchMutation } from './auth-server'
import { $scrapeUrl, $screenShotUrl } from './firecrawl'
import { timestamp, uniqueId, WebhookRequest } from './utils'

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
    return '[native function]'
  }
}

function formatArgs(args: any[]): string {
  return args.map(formatValue).join(' ')
}

function formatHeaders(requestCtx: WebhookRequest): Record<string, string> {
  let _temp = {} as Record<string, string>

  for (const item of requestCtx.headers) {
    _temp[item.key] = item.value
  }

  return _temp
}

function formatQuery(requestCtx: WebhookRequest): Record<string, string> {
  let _temp = {} as Record<string, string>

  for (const item of requestCtx.query || []) {
    _temp[item.key] = item.value
  }

  return _temp
}

export type WebhookCtx = {
  webhookOrigin: string
  fingerprintId: string
  uploadUrl: string
}

type Logs = {
  id: string
  level: 'log' | 'error'
  message: string
  timestamp: string
}

type Script = {
  ctx: 'client-side' | 'server-side'
  code: string
}

type Result = {
  success: boolean
  result?: any
  logs: Logs[]
  error?: string
}

type UploadJsonAsBlobReturn = { storageId: string }

const withCtxMethods = (ctx: WebhookCtx) => {
  const $set = async (key: string, value: string) => {
    return await fetchMutation(api.scripting.handleKeyValueOpts, {
      webhookOrigin: ctx.webhookOrigin,
      fingerprintId: ctx.fingerprintId,
      opts: '$set',
      key,
      value,
    })
  }

  const $get = async (key: string) => {
    return await fetchMutation(api.scripting.handleKeyValueOpts, {
      webhookOrigin: ctx.webhookOrigin,
      fingerprintId: ctx.fingerprintId,
      opts: '$get',
      key,
    })
  }

  const $setFile = async (fileName: string, storageId: string) => {
    return await fetchMutation(api.scripting.handleKeyValueOpts, {
      webhookOrigin: ctx.webhookOrigin,
      fingerprintId: ctx.fingerprintId,
      opts: '$setFile',
      fileName,
      storageId,
    })
  }

  const $getFile = async (fileName: string) => {
    return await fetchMutation(api.scripting.handleKeyValueOpts, {
      webhookOrigin: ctx.webhookOrigin,
      fingerprintId: ctx.fingerprintId,
      opts: '$getFile',
      fileName,
    })
  }

  const $uploadJsonAsBlob = async (
    content: string,
  ): Promise<UploadJsonAsBlobReturn> => {
    let data: string
    let type: string

    if (typeof content === 'object' && content !== null) {
      data = JSON.stringify(content)
      type = 'application/json'
    } else if (typeof content === 'string') {
      try {
        JSON.parse(content)
        data = content
        type = 'application/json'
      } catch {
        data = content
        type = 'text/plain'
      }
    } else {
      throw new Error('Unable to upload this data type')
    }

    const blob = new Blob([data], { type })

    const req = await axios.post(ctx.uploadUrl, blob, {
      headers: {
        'Content-Type': type,
      },
    })

    return req.data
  }

  return { $get, $set, $uploadJsonAsBlob, $setFile, $getFile }
}

export async function runCode(
  script: Script,
  requestCtx: WebhookRequest,
  webhookCtx: WebhookCtx,
): Promise<Result> {
  let evalLogs: Logs[] = []

  const newConsole = {
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
  }

  const ctx = {
    z,
    fetch,
    request: {
      ...requestCtx,
      headers: formatHeaders(requestCtx),
      query: formatQuery(requestCtx),
    },
    console: newConsole,

    // Utilities
    $scrapeUrl,
    $screenShotUrl,
    $uniqueId: uniqueId,

    // Response
    $json: (payload: string, init?: ResponseInit) => {
      return script.ctx === 'client-side' ? null : json(payload, init)
    },
    $text: (payload: string, init?: ResponseInit) => {
      return script.ctx === 'client-side' ? null : new Response(payload, init)
    },

    // Requires ctx
    ...withCtxMethods(webhookCtx),
  }

  vm.createContext(ctx)
  evalLogs = [] // clear logs for each run

  try {
    const wrapped = `
      (async () => {
        try {
          ${script.code}

          return onRequest()
        } catch (err) {
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
