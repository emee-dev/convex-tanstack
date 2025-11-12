import { v } from 'convex/values'
import { query } from './_generated/server'
import { buildSearch, parseQuery } from "./lib/utils"

export const searchRequests = query({
  args: {
    searchQuery: v.string(),
    fingerprintId: v.string(),
  },
  handler: async (ctx, args) => {
    const limit = 5
    const { error, data } = parseQuery(args.searchQuery)

    if (error) throw new Error(error)

    if (!data) throw new Error('Something went wrong. Try again.')

    const q = ctx.db.query('requests')

    if (data.filter_field === 'request_body') {
      const results = await q
        .withSearchIndex('search_request_body', (q) =>
          buildSearch({
            q,
            field: 'requestBody',
            queryValue: data.query,
            filterFrom: data.filter_from,
            filterMethod: data.filter_method,
            fingerprintId: args.fingerprintId,
          }),
        )
        .take(limit)

      return results
    }

    if (data.filter_field === 'note') {
      const results = await q
        .withSearchIndex('search_note', (q) =>
          buildSearch({
            q,
            field: 'note',
            queryValue: data.query,
            filterFrom: data.filter_from,
            filterMethod: data.filter_method,
            fingerprintId: args.fingerprintId,
          }),
        )
        .take(limit)

      return results
    }
  },
})
