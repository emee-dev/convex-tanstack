import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  requests: defineTable({
    fingerprintId: v.string(),
    origin: v.string(),
    method: v.string(),
    meta: v.array(
      v.object({
        key: v.union(
          v.literal('method'),
          v.literal('url'),
          v.literal('date'),
          v.literal('size'),
          v.literal('note'),
        ),
        value: v.string(),
      }),
    ),
    query: v.optional(
      v.array(
        v.object({
          key: v.string(),
          value: v.string(),
        }),
      ),
    ),
    headers: v.array(
      v.object({
        key: v.string(),
        value: v.string(),
      }),
    ),
    bodyType: v.union(
      v.literal('application/json'),
      v.literal('multipart/form-data'),
      v.literal('application/octet-stream'),
      v.literal('text/plain'),
      v.literal('form'),
      v.literal('empty'),
    ),
    note: v.optional(v.string()),
    requestBody: v.string(),
    // Will be defined if bodyType === "blob"
    storageId: v.optional(v.id('_storage')),

    shouldPersist: v.boolean(),
  })
    .searchIndex('search_note', {
      searchField: 'note',
      filterFields: ['origin', 'method', 'fingerprintId'],
    })
    .searchIndex('search_request_body', {
      searchField: 'requestBody',
      filterFields: ['origin', 'method', 'fingerprintId'],
    }),

  scripts: defineTable({
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    source: v.string(),
    logs: v.array(
      v.object({
        id: v.string(),
        level: v.union(v.literal('log'), v.literal('error')),
        message: v.string(),
        timestamp: v.string(),
      }),
    ),
    kv: v.array(
      v.object({
        key: v.string(),
        value: v.union(v.string(), v.number(), v.null(), v.boolean()),
      }),
    ),
    file: v.array(
      v.object({
        fileName: v.string(),
        storageId: v.id('_storage'),
      }),
    ),
    requestsLeft: v.optional(v.literal('one')),
  }),

  // Used to store reuseable data regarding the app
  config: defineTable({
    uploadUrl: v.string(),
  }),
})
