type FilterField = 'note' | 'request_body'

type Query = {
  query: string
  filter_from?: string
  filter_method?: string
  filter_field?: FilterField
}

type ParseQuerySuccess = {
  error: null
  data: Query
}

type ParseQueryError = {
  error: string
  data: null
}

type ParseQueryResult = ParseQuerySuccess | ParseQueryError

export const parseQuery = (q: string): ParseQueryResult => {
  const t: Partial<Query> = {
    filter_field: 'request_body',
  }

  const FROM = 'fr:'
  const METHOD = 'm:'
  const INCLUDE = 'in:'

  for (const item of q.split(' ')) {
    if (item.startsWith(FROM)) {
      t.filter_from = item.replace(FROM, '')
      continue
    }

    if (item.startsWith(METHOD)) {
      t.filter_method = item.replace(METHOD, '').toUpperCase()
      continue
    }

    if (item.startsWith(INCLUDE)) {
      const candidate = item.replace(INCLUDE, '') as FilterField

      if (!['request_body', 'note'].includes(candidate)) {
        return { error: 'Invalid value for request fields', data: null }
      }

      t.filter_field = candidate
      continue
    }

    t.query = item
  }

  if (!t.query) {
    return { error: 'Missing main query term', data: null }
  }

  return { error: null, data: t as Query }
}

type BuildSearchArgs = {
  q: any
  field: string
  queryValue: string
  fingerprintId: string
  filterFrom?: string | null
  filterMethod?: string | null
}

export const buildSearch = ({
  q,
  field,
  queryValue,
  fingerprintId,
  filterFrom,
  filterMethod,
}: BuildSearchArgs) => {
  const steps = [
    (qb: any) => qb.search(field, queryValue),
    filterFrom ? (qb: any) => qb.eq('origin', filterFrom) : null,
    filterMethod ? (qb: any) => qb.eq('meta.method', filterMethod) : null,
    fingerprintId ? (qb: any) => qb.eq('fingerprintId', fingerprintId) : null,
  ].filter(Boolean)

  return steps.reduce((qb: any, step: any) => step(qb), q)
}
