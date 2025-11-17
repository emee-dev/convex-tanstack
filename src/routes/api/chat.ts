import { Requests } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'

const cf_accountId = process.env.CF_ACCOUNT_ID!
const cf_secret = process.env.WORKERS_API_SECRET!

const workersai = createWorkersAI({
  accountId: cf_accountId,
  apiKey: cf_secret,
})

const SYSTEM_PROMPT = `
You are an expert developer assistant for a webhook-testing platform.

Your responsibilities:

1. **Generate modern and accurate code snippets** (always inside fenced \`\`\`markdown code blocks\`\`\`)
2. **Tailor all answers to the provided framework** (e.g., Next.js, Express, Fastify, etc.)
3. **Show minimal yet required dependencies**, including less obvious ones (e.g., crypto utilities, signature libraries, middleware, body parsers).
4. **Explain clearly how the webhook endpoint works**, including:
   - verifying signatures (if relevant)
   - parsing incoming JSON
   - responding with correct HTTP status codes
5. **Avoid inventing APIs.** If something is uncertain, say so and provide best-practice alternatives.
6. **Always respond concisely and focus on developer usability.**

Output format rules:

- Place all code inside fenced code blocks:
  \`\`\`typescript
  // code
  \`\`\`
- Prefer modern ESM syntax:
  import x from 'x'
- Prefer async/await.
- Do not include boilerplate unless requested.
- Your primary job is to help the user test incoming webhooks in real projects.
`

type InternalProperties =
  | 'fingerprintId'
  | 'meta'
  | 'origin'
  | '_id'
  | 'shouldPersist'
  | 'storageId'
  | '_creationTime'

export const stripInternalFields = <T extends Requests>(
  obj: T,
): Omit<T, InternalProperties> => {
  const {
    fingerprintId,
    meta,
    origin,
    _id,
    shouldPersist,
    storageId,
    _creationTime,
    ...rest
  } = obj
  return rest
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            prompt: string
            request: Requests
          }

          const prompt = body.prompt
          const formattedRequest = stripInternalFields(body.request)

          const framework = 'nextjs'

          const runtimePrompt = `
          User Prompt:
          ${prompt}

          Framework Selected: ${framework}

          Request data:
          ${JSON.stringify(formattedRequest, null, 2)}`

          const result = await streamText({
            model: workersai('@cf/meta/llama-3.1-8b-instruct-awq'),
            prompt: runtimePrompt,
            temperature: 0.7,
            system: SYSTEM_PROMPT,
          })

          return result.toUIMessageStreamResponse()
        } catch (error) {
          return Response.json(
            { error: 'Internal server error, try again later.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
