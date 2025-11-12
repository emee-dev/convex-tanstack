import { checkFingerprint } from '@/actions/server'
import { parseBody, parseHeaders, parseQuery } from '@/lib/req'
import { Requests } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

type WebhookRequest = Omit<Requests, '_id' | '_creationTime'>

export const Route = createFileRoute('/$reqId')({
  server: {
    middleware: [checkFingerprint],
    handlers: {
      ANY: async ({ params, request }) => {
        const note = ''
        const query = await parseQuery(request)
        const headers = await parseHeaders(request)
        const parsed = await parseBody(request)

        const fingerprintId = params.reqId
        const origin = (params as any)?.['**'] || 'webhook.sh'

        let blob: Blob

        if (
          parsed.kind === 'application/json' ||
          parsed.kind === 'text/plain'
        ) {
          blob = new Blob([parsed.raw])
        } else {
          blob = new Blob([''])
        }

        let requestBody = null

        if (['application/json', 'text/plain'].includes(parsed.kind)) {
          requestBody = parsed.raw as string
        } else if (
          ['application/x-www-form-urlencoded'].includes(parsed.kind)
        ) {
          requestBody = 'application/x-www-form-urlencoded'
        } else {
          requestBody = ''
        }

        const payload: WebhookRequest = {
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
        }

        return json({ hint: 'No response configured for this origin.' })
      },
    },
  },
})
