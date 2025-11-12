import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const createScript = mutation({
  args: {
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
    env: v.array(
      v.object({
        key: v.string(),
        value: v.any(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existingRecord = await ctx.db
      .query('scripts')
      .filter((q) =>
        q.and(
          q.eq(q.field('webhookOrigin'), args.webhookOrigin),
          q.eq(q.field('fingerprintId'), args.fingerprintId),
        ),
      )
      .first()

    if (existingRecord) return

    return await ctx.db.insert('scripts', {
      fingerprintId: args.fingerprintId,
      source: args.source,
      logs: args.logs || [],
      env: args.env || [],
      webhookOrigin: args.webhookOrigin,
    })
  },
})

export const editScript = mutation({
  args: {
    scriptId: v.id('scripts'),
    source: v.string(),
    logs: v.array(
      v.object({
        id: v.string(),
        level: v.union(v.literal('log'), v.literal('error')),
        message: v.string(),
        timestamp: v.string(),
      }),
    ),
    env: v.array(
      v.object({
        key: v.string(),
        value: v.any(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.scriptId, {
      source: args.source,
      env: args.env,
      logs: args.logs,
    })
  },
})
