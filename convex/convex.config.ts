import { defineApp } from 'convex/server'
import crons from '@convex-dev/crons/convex.config'
import betterAuth from '@convex-dev/better-auth/convex.config'

const app = defineApp()
app.use(crons)
app.use(betterAuth)

export default app
