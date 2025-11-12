import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { runCode } from '@/lib/scripting'
import { z } from 'zod/v4'
import { fetchMutation, fetchQuery } from '@/lib/auth-server'
import { api } from '@/convex/_generated/api'

const EvalJsSchema = z.object({
  job: z.object({
    id: z.string(),
    code: z.string(),
  }),
  requestCtx: z.any(),
})

const EditNoteSchema = z.object({
  note: z.string(),
  requestId: z.string(),
})

export const getUploadUrl = createServerFn().handler(async () => {
  const query = await fetchQuery(api.requests.getUploadUrl, {})
  return query?.uploadUrl
})

export const evalJS = createServerFn({ method: 'POST' })
  .inputValidator(EvalJsSchema)
  .handler(async (args) => {
    return await runCode(args.data.job, args.data.requestCtx)
  })

export const editNote = createServerFn({ method: 'POST' })
  .inputValidator(EditNoteSchema)
  .handler(async ({ data }) => {
    return await fetchMutation(api.requests.editNote, {
      id: data.requestId,
      note: data.note,
    })
  })

export const checkFingerprint = createMiddleware().server(
  async ({ next }) => {
    console.log('Hey')
    const result = await next()
    return result
  },
)
