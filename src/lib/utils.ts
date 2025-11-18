import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Doc, Id } from '@/convex/_generated/dataModel'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDev = process.env.NODE_ENV === 'development'
export const cloudflareDeployment = process.env.CLOUDFLARE_DEPLOYMENT === 'true'

type Urls = {
  downloadUrl: string | null
  storageId: Id<'_storage'>
  fileName: string
}

export type Requests = Doc<'requests'>
export type Scripts = Omit<Doc<'scripts'>, 'file'> & {
  file: Urls[]
}

export type WebhookRequest = Omit<
  Requests,
  '_id' | '_creationTime' | 'shouldPersist'
>

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'PATCH'
  | 'PUT'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT'

interface StyleSet {
  method: string
}

const styles: Record<HttpMethod, StyleSet> = {
  POST: {
    method:
      'bg-blue-400/20 dark:bg-blue-400/20 text-blue-700 dark:text-blue-400',
  },
  GET: {
    method:
      'bg-green-400/20 dark:bg-green-400/20 text-green-700 dark:text-green-400',
  },
  DELETE: {
    method: 'bg-red-400/20 dark:bg-red-400/20 text-red-700 dark:text-red-400',
  },
  PATCH: {
    method:
      'bg-orange-400/20 dark:bg-orange-400/20 text-orange-700 dark:text-orange-400',
  },
  PUT: {
    method:
      'bg-yellow-400/20 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400',
  },
  HEAD: {
    method:
      'bg-cyan-400/20 dark:bg-cyan-400/20 text-cyan-700 dark:text-cyan-400',
  },
  OPTIONS: {
    method:
      'bg-purple-400/20 dark:bg-purple-400/20 text-purple-700 dark:text-purple-400',
  },
  TRACE: {
    method:
      'bg-pink-400/20 dark:bg-pink-400/20 text-pink-700 dark:text-pink-400',
  },
  CONNECT: {
    method:
      'bg-indigo-400/20 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-400',
  },
}

export function color(method: string | null): string {
  if (!method) return ''

  const upper = method.toUpperCase() as HttpMethod
  const styleSet = styles?.[upper]

  if (!styleSet) return ''

  return styleSet.method
}

export const timestamp = (): string => {
  const date = new Date()

  const hr = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const sec = String(date.getUTCSeconds()).padStart(2, '0')
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0')

  return `${hr}:${min}:${sec}.${ms}Z`
}

export const uniqueId = () => crypto.randomUUID()

export function getInitials(name: string): string {
  if (!name) return ''

  return name
    .trim()
    .split(/\s+/) // split on spaces (handles multiple spaces)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}
