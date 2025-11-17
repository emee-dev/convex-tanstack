import { z, toJSONSchema } from 'zod/v4'

const secret = process.env.FIRECRAWL_API_KEY
const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v2/scrape'

type FirecrawlMetadata = {
  'msapplication-config'?: string
  language?: string
  'next-size-adjust'?: string
  'og:type'?: string
  'twitter:image:width'?: string
  'msapplication-TileColor'?: string
  'og:title'?: string
  charset?: string
  description?: string
  'apple-mobile-web-app-title'?: string
  ogDescription?: string
  'twitter:title'?: string
  'twitter:description'?: string
  'twitter:image:height'?: string
  'application-name'?: string
  ogTitle?: string
  ogUrl?: string
  'og:image'?: string
  'og:url'?: string
  'twitter:card'?: string
  'twitter:image'?: string
  canonical?: string
  ogImage?: string
  'og:site_name'?: string
  'og:image:width'?: string
  'og:image:height'?: string
  'og:description'?: string
  title?: string
  viewport?: string
  generator?: string
  favicon?: string
  scrapeId?: string
  sourceURL?: string
  url?: string
  statusCode?: number
  contentType?: string
  proxyUsed?: string
  cacheState?: string
  indexId?: string
  creditsUsed?: number

  // Allow for any extra unknown keys (in case Firecrawl adds more)
  [key: string]: any
}

type ScreenShotUrlArgs = {
  fullPage: boolean
  width: number
  height: number
  quality: number
}

type ScreenShotUrlReturn = {
  success: boolean
  screenshot: string
}

export const $screenShotUrl = async (
  url: string,
  opts: ScreenShotUrlArgs = {
    height: 682,
    width: 1272,
    fullPage: true,
    quality: 90,
  },
): Promise<ScreenShotUrlReturn> => {
  const response = await fetch(FIRECRAWL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      url,
      waitFor: 1000,
      formats: [
        {
          type: 'screenshot',
          fullPage: opts.fullPage,
          quality: opts.quality,
          viewport: {
            height: opts.height,
            width: opts.width,
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Invalid request, retrying')
  }

  const data = (await response.json()) as {
    success: boolean
    data: {
      screenshot: string
      metadata: FirecrawlMetadata
    }
  }

  if (!data) {
    throw new Error('Unable to screenshot url')
  }

  return { success: data.success, screenshot: data.data.screenshot }
}

type ScrapeUrlArgs = {
  prompt?: string
  schema?: z.core.$ZodType
}

type ScrapeUrlReturn = {
  success: boolean
  data: any
  metadata: FirecrawlMetadata
}

export const $scrapeUrl = async (
  url: string,
  opts: ScrapeUrlArgs = {
    prompt: `Extract any meaningful info from the page.`,
  },
): Promise<ScrapeUrlReturn> => {
  const response = await fetch(FIRECRAWL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      url,
      waitFor: 1000,
      formats: [
        {
          type: 'json',
          prompt: opts?.prompt,
          ...(opts?.schema && { schema: toJSONSchema(opts.schema) }),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Invalid request, retrying')
  }

  const data = (await response.json()) as {
    success: boolean
    data: {
      json: any
      metadata: FirecrawlMetadata
    }
  }

  if (!data) {
    throw new Error('Unable to screenshot url')
  }

  return {
    success: data.success,
    data: data.data.json,
    metadata: data.data.metadata,
  }
}
