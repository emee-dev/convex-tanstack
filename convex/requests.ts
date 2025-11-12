import { v } from 'convex/values'
import { query } from './_generated/server'
import { mutation } from './functions'

export const getUploadUrl = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('config').first()
  },
})

export const editNote = mutation({
  args: { id: v.id('requests'), note: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new Error('Request not found')
    }

    const meta = request.meta.filter((item) => item.key !== 'note')

    return await ctx.db.patch(args.id, {
      note: args.note,
      meta: [...meta, { key: 'note', value: args.note }],
    })
  },
})

export const getRecentRequests = query({
  args: {
    browserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .order('desc')
      .filter((q) => q.eq(q.field('fingerprintId'), args.browserId))
      .take(25)
  },
})

export const insertRequest = mutation({
  args: {
    fingerprintId: v.string(),
    method: v.string(),
    meta: v.array(
      v.object({
        key: v.union(
          v.literal('method'),
          v.literal('url'),
          v.literal('date'),
          v.literal('size'),
        ),
        value: v.string(),
      }),
    ),
    origin: v.string(),
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
      v.literal('text/plain'),
      v.literal('form'),
      v.literal('blob'),
      v.literal('empty'),
    ),
    note: v.string(),
    requestBody: v.string(),
    // Will be defined if bodyType === "blob"
    storageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('requests', {
      ...args,
      shouldPersist: false,
    })
  },
})

export const toggleShouldPersist = mutation({
  args: { id: v.id('requests'), shouldPersist: v.boolean() },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id)
    if (!todo) {
      throw new Error('request not found')
    }
    return await ctx.db.patch(args.id, {
      shouldPersist: args.shouldPersist,
    })
  },
})

export const deleteRequest = mutation({
  args: { id: v.id('requests') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})
