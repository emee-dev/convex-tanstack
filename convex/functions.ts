import {
  customCtx,
  customMutation,
} from 'convex-helpers/server/customFunctions'
import { Triggers } from 'convex-helpers/server/triggers'
import { DataModel } from './_generated/dataModel'
import {
  internalMutation as rawInternalMutation,
  mutation as rawMutation,
} from './_generated/server'

const triggers = new Triggers<DataModel>()

// Remove related scripts when all but one webhook for an origin remains.
triggers.register('requests', async (ctx, change) => {
  if (change.operation === 'delete') {
    const origin = change.oldDoc.origin
    const scriptForOrigin = await ctx.db
      .query('scripts')
      .filter((q) => q.eq(q.field('webhookOrigin'), origin))
      .first()

    if (!scriptForOrigin) return

    if (scriptForOrigin?.requestsLeft === 'one') {
      ctx.db.delete(scriptForOrigin._id)
    }
  }
})

// Helps when checking for scripts to remove.
triggers.register('requests', async (ctx, change) => {
  const origin = change.newDoc?.origin as string
  const browserId = change.newDoc?.fingerprintId as string

  if (!origin || !browserId) return

  const recordsLeft = await ctx.db
    .query('requests')
    .filter((q) =>
      q.and(
        q.eq(q.field('origin'), origin),
        q.eq(q.field('fingerprintId'), browserId),
      ),
    )
    .take(2)

  if (recordsLeft.length > 1) return

  const script = await ctx.db
    .query('scripts')
    .filter((q) =>
      q.and(
        q.eq(q.field('webhookOrigin'), origin),
        q.eq(q.field('fingerprintId'), browserId),
      ),
    )
    .first()

  if (script && recordsLeft.length === 1) {
    await ctx.db.patch(script._id, {
      requestsLeft: 'one',
    })
  }
})

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB))
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
)
