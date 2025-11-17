import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getScript = query({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query('scripts')
      .filter((q) =>
        q.and(
          q.eq(q.field('webhookOrigin'), args.webhookOrigin),
          q.eq(q.field('fingerprintId'), args.fingerprintId),
        ),
      )
      .first()

    if (!record) return null

    const urls = await Promise.all(
      record.file.map(async (e) => ({
        ...e,
        downloadUrl: await ctx.storage.getUrl(e.storageId),
      })),
    )

    return { ...record, file: urls }
  },
})

export const createScript = mutation({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    source: v.string(),
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
      webhookOrigin: args.webhookOrigin,
      requestsLeft: undefined,
      logs: [],
      kv: [],
      file: [],
    })
  },
})

export const editSource = mutation({
  args: {
    scriptId: v.id('scripts'),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.scriptId, {
      source: args.source,
    })
  },
})

export const handleKeyValueOpts = mutation({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    opts: v.union(v.literal('$set'), v.literal('$get')),
    key: v.string(),
    value: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.opts === '$get') {
      const record = await ctx.db
        .query('scripts')
        .filter((q) =>
          q.and(
            q.eq(q.field('webhookOrigin'), args.webhookOrigin),
            q.eq(q.field('fingerprintId'), args.fingerprintId),
          ),
        )
        .first()

      if (!record) return null

      const entry = record?.kv.find((item) => item.key === args.key)

      if (!entry) return null

      return entry.value
    }

    if (args.opts === '$set' && args.value) {
      const record = await ctx.db
        .query('scripts')
        .filter((q) =>
          q.and(
            q.eq(q.field('webhookOrigin'), args.webhookOrigin),
            q.eq(q.field('fingerprintId'), args.fingerprintId),
          ),
        )
        .first()

      if (!record) return false

      const oldEntrys = record?.kv.filter((item) => item.key !== args.key)

      await ctx.db.patch(record._id, {
        kv: [...oldEntrys, { key: args.key, value: args.value }],
      })

      return true
    }
  },
})

export const handleFileOpts = mutation({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    opts: v.union(v.literal('$setFile'), v.literal('$getFile')),
    fileName: v.string(),
    storageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    if (args.opts === '$getFile') {
      const record = await ctx.db
        .query('scripts')
        .filter((q) =>
          q.and(
            q.eq(q.field('webhookOrigin'), args.webhookOrigin),
            q.eq(q.field('fingerprintId'), args.fingerprintId),
          ),
        )
        .first()

      if (!record) return null

      const file = record?.file.find((item) => item.fileName === args.fileName)

      if (!file) return null

      return await ctx.storage.getUrl(file.storageId)
    }

    if (args.opts === '$setFile' && args.storageId) {
      const record = await ctx.db
        .query('scripts')
        .filter((q) =>
          q.and(
            q.eq(q.field('webhookOrigin'), args.webhookOrigin),
            q.eq(q.field('fingerprintId'), args.fingerprintId),
          ),
        )
        .first()

      if (!record) return false

      const oldFiles = record?.file.filter(
        (item) => item.fileName !== args.fileName,
      )

      await ctx.db.patch(record._id, {
        file: [
          ...oldFiles,
          { fileName: args.fileName, storageId: args.storageId },
        ],
      })

      return true
    }
  },
})

export const deleteKvEntry = mutation({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query('scripts')
      .filter((q) =>
        q.and(
          q.eq(q.field('webhookOrigin'), args.webhookOrigin),
          q.eq(q.field('fingerprintId'), args.fingerprintId),
        ),
      )
      .first()

    if (!record) return null

    let filtered = record.kv.filter((q) => q.key !== args.key)

    ctx.db.patch(record._id, {
      kv: filtered,
    })
  },
})

export const deleteFileEntry = mutation({
  args: {
    webhookOrigin: v.string(),
    fingerprintId: v.string(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query('scripts')
      .filter((q) =>
        q.and(
          q.eq(q.field('webhookOrigin'), args.webhookOrigin),
          q.eq(q.field('fingerprintId'), args.fingerprintId),
        ),
      )
      .first()

    if (!record) return null

    let filtered = record.file.filter((q) => q.storageId !== args.storageId)

    await ctx.db.patch(record._id, {
      file: filtered,
    })

    await ctx.storage.delete(args.storageId)
  },
})
