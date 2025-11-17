import { MINUTE, RateLimiter } from '@convex-dev/rate-limiter'
import { components } from './_generated/api'
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  webhook: {
    kind: 'fixed window',
    rate: 100,
    period: MINUTE,
    capacity: 2,
  },
  aiChat: { kind: 'token bucket', rate: 40000, period: MINUTE, shards: 10 },
})

export const rateLimitMiddleware = mutation({
  args: {
    browserId: v.string(),
  },
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, 'webhook', {
      key: args.browserId,
    })

    return status
  },
})
