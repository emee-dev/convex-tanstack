'use node'
import { action } from './_generated/server'
import { runCode } from '../src/lib/vm'
import { v } from 'convex/values'

export const evalJs = action({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await runCode(args.code)
    return result
  },
})
