import z from 'zod/v4'

export const EvalJsSchema = z.object({
  script: z.object({
    ctx: z.union([z.literal('client-side'), z.literal('server-side')]),
    code: z.string(),
  }),
  requestCtx: z.object({
    bodyType: z.union([
      z.literal('application/json'),
      z.literal('multipart/form-data'),
      z.literal('application/octet-stream'),
      z.literal('text/plain'),
      z.literal('form'),
      z.literal('empty'),
    ]),
    method: z.string(),
    fingerprintId: z.string(),
    origin: z.string(),
    note: z.optional(z.string()),
    query: z.optional(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
    ),
    meta: z.array(
      z.object({
        key: z.union([
          z.literal('url'),
          z.literal('date'),
          z.literal('note'),
          z.literal('size'),
          z.literal('method'),
        ]),
        value: z.string(),
      }),
    ),
    headers: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    ),
    requestBody: z.string(),
    shouldPersist: z.boolean(),
    // Id<"storageId">
    storageId: z.any(),
  }),
  webhookCtx: z.object({
    webhookOrigin: z.string(),
    fingerprintId: z.string(),
    uploadUrl: z.string(),
  }),
})

export const EditNoteSchema = z.object({
  note: z.string(),
  requestId: z.string(),
})

export const webhookSchema = z.object({
  reqId: z.string(),
  '**': z.string().default('webhook.sh'),
})
