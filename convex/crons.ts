import { cronJobs } from 'convex/server'
import { internalMutation } from './functions'
import { internal } from './_generated/api'

const crons = cronJobs()

export const deleteRequests = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('requests')
      .filter((q) => q.eq(q.field('shouldPersist'), false))
      .take(50)

    return await Promise.all(requests.map((item) => ctx.db.delete(item._id)))
  },
})

export const generateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl()

    const existingRecord = await ctx.db.query('config').first()

    if (!existingRecord) {
      await ctx.db.insert('config', { uploadUrl })
    } else {
      ctx.db.patch(existingRecord._id, { uploadUrl })
    }
  },
})

// crons.daily(
//   'Delete unpersisted requests',
//   {
//     hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
//     minuteUTC: 30,
//   },
//   internal.crons.deleteRequests,
// )

// crons.interval(
//   'Regenerate upload url',
//   { minutes: 40 },
//   internal.crons.generateUploadUrl,
// )

export default crons
