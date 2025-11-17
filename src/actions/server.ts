import { api } from '@/convex/_generated/api'
import { fetchMutation, fetchQuery } from '@/lib/auth-server'
import { runCode } from '@/lib/scripting'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { EditNoteSchema, EvalJsSchema, webhookSchema } from './schema'

export const getUploadUrl = createServerFn().handler(async () => {
  const query = await fetchQuery(api.requests.getUploadUrl, {})
  return query?.uploadUrl
})

export const evalJS = createServerFn({ method: 'POST' })
  .inputValidator(EvalJsSchema)
  .handler(async (args) => {
    const { script, requestCtx, webhookCtx } = args.data

    return await runCode(script, requestCtx, webhookCtx)
  })

export const editNote = createServerFn({ method: 'POST' })
  .inputValidator(EditNoteSchema)
  .handler(async ({ data }) => {
    return await fetchMutation(api.requests.editNote, {
      id: data.requestId,
      note: data.note,
    })
  })

type RatelimitCtx = {
  browserId: string
  origin: string
  error: Response | null
}

export const rateLimitMiddleware = createMiddleware({ type: 'request' }).server(
  async (args) => {
    const data = webhookSchema.parse((args as any)?.params)

    const browserId = data.reqId
    const origin = data['**']

    const status = await fetchMutation(api.ratelimit.rateLimitMiddleware, {
      browserId,
    })

    const context: RatelimitCtx = {
      browserId,
      origin,
      error: null,
    }

    if (!status.ok) {
      return await args.next({
        context: {
          ...context,
          error: Response.json(
            { msg: 'You are being ratelimited, Try again later.' },
            { status: 429 },
          ),
        },
      })
    }

    return await args.next({
      context,
    })
  },
)
