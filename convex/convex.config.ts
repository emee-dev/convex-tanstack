import { defineApp } from 'convex/server'
import crons from '@convex-dev/crons/convex.config'
import betterAuth from '@convex-dev/better-auth/convex.config'
import rateLimiter from '@convex-dev/rate-limiter/convex.config.js'

const app = defineApp()
app.use(crons)
app.use(betterAuth)
app.use(rateLimiter)

export default app
