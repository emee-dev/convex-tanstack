import { Requests } from './utils'

export type ParsedBody =
  | { kind: 'application/json'; raw: string }
  | { kind: 'text/plain'; raw: string }
  | { kind: 'form'; raw: Record<string, string | string[]> }
  | { kind: 'blob'; raw: Buffer }
  | { kind: 'empty'; raw: '' | null }

export async function parseQuery(request: Request): Promise<Requests['query']> {
  const url = new URL(request.url)

  const items = []
  for (const [key, value] of url.searchParams.entries()) {
    items.push({
      key,
      value,
    })
  }

  const grouped = items.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.key]) {
      acc[item.key] = []
    }
    acc[item.key].push(item.value)
    return acc
  }, {})

  return Object.entries(grouped).map(([key, values]) => ({
    key,
    value: values.join(','),
  }))
}

export async function parseHeaders(
  request: Request,
): Promise<Requests['headers']> {
  const items = [] as Requests['headers']

  for (const [key, value] of request.headers) {
    items.push({
      key,
      value,
    })
  }

  return items
}

export async function parseBody(request: Request): Promise<ParsedBody> {
  const contentType = request.headers.get('content-type') ?? ''
  const ct = contentType.split(';')[0].trim().toLowerCase()

  // If no body
  if (
    request.bodyUsed === false &&
    (request.method === 'GET' || request.method === 'HEAD')
  ) {
    return { kind: 'empty', raw: '' }
  }

  // JSON
  if (ct === 'application/json' || contentType.includes('json')) {
    const text = await request.text()

    return { kind: 'application/json', raw: text }
  }

  if (ct === 'text/plain' || contentType.includes('text')) {
    const text = await request.text()

    return { kind: 'text/plain', raw: text }
  }

  if (ct === 'application/x-www-form-urlencoded') {
    const raw = await request.text()
    const params = new URLSearchParams(raw)
    const obj: Record<string, string | string[]> = {}
    for (const key of params.keys()) {
      const vals = params.getAll(key)
      obj[key] = vals.length > 1 ? vals : vals[0]
    }
    return { kind: 'form', raw: obj }
  }

  // if (ct === 'multipart/form-data') {
  // }

  return { kind: 'empty', raw: '' }
}
