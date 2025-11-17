import { rateLimitMiddleware } from '@/actions/server'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { fetchQuery } from '@/lib/auth-server'
import { parseBody, parseHeaders, parseQuery } from '@/lib/req'
import { runCode, WebhookCtx } from '@/lib/scripting'
import { WebhookRequest } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import axios from 'axios'

const uploadFile = async ({
  uploadUrl,
  data,
  contentType,
}: {
  uploadUrl: string
  data: ArrayBuffer
  contentType: string
}) => {
  try {
    const req = await axios.post(uploadUrl, data, {
      headers: {
        'Content-Type': contentType,
      },
    })
    const res = req.data as { storageId: string }

    return {
      error: null,
      data: res.storageId,
    }
  } catch (error: any) {
    console.error('')
    return { error: error as Error, data: null }
  }
}

export const Route = createFileRoute('/n/$reqId')({
  server: {
    middleware: [rateLimitMiddleware],
    handlers: {
      ANY: async ({ request, context }) => {
        try {
          if (context?.error) {
            return context.error
          }

          const note = ''
          const query = await parseQuery(request)
          const headers = await parseHeaders(request)
          const parsed = await parseBody(request)

          const fingerprintId = context.browserId
          const origin = context.origin

          let script = ''
          let uploadUrl = ''

          if (script.includes('$uploadJsonAsBlob')) {
            const metadata = await fetchQuery(api.requests.getUploadUrl, {})

            if (!metadata) {
              return
            }

            uploadUrl = metadata.uploadUrl
          }

          const data = await fetchQuery(api.scripting.getScript, {
            webhookOrigin: origin,
            fingerprintId,
          })

          if (data?.source) {
            script = data?.source
          }

          let blob: Blob

          if (
            parsed.kind === 'application/json' ||
            parsed.kind === 'text/plain'
          ) {
            blob = new Blob([parsed.raw])
          } else {
            blob = new Blob([''])
          }

          let requestBody = ''
          let storageId = undefined

          if (['application/json', 'text/plain'].includes(parsed.kind)) {
            requestBody = parsed.raw as string
          } else if (
            ['application/x-www-form-urlencoded'].includes(parsed.kind)
          ) {
            requestBody = ''
          } else if (
            ['multipart/form-data', 'application/octet-stream'].includes(
              parsed.kind,
            )
          ) {
            const { error, data } = await uploadFile({
              uploadUrl,
              data: parsed.raw as ArrayBuffer,
              contentType: parsed.kind,
            })

            console.error('Upload error: ', error)

            storageId = data && !error ? (data as Id<'_storage'>) : undefined
          } else {
            requestBody = ''
          }

          const requestCtx: WebhookRequest = {
            bodyType: parsed.kind,
            method: request.method,
            fingerprintId,
            origin,
            note,
            query,
            meta: [
              { key: 'url', value: request.url },
              {
                key: 'date',
                value: new Date().toISOString(),
              },
              {
                key: 'note',
                value: note,
              },
              {
                key: 'size',
                value: String(blob.size),
              },
              {
                key: 'method',
                value: request.method.toUpperCase(),
              },
            ],
            headers,
            requestBody,
            shouldPersist: false,
            storageId,
          }

          const webhookCtx: WebhookCtx = {
            fingerprintId,
            webhookOrigin: origin,
            uploadUrl,
          }

          const result = await runCode(
            {
              ctx: 'server-side',
              code: script,
            },
            requestCtx,
            webhookCtx,
          )

          if (result.result instanceof Response) {
            return result.result
          }

          return json({ hint: 'No response configured for this origin.' })
        } catch (error) {
          console.error(error)
          return json({ hint: 'No response configured for this origin.' })
        }
      },
    },
  },
})
