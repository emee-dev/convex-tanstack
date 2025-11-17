import { cloudflare } from '@cloudflare/vite-plugin'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const platform = process.env.PLAT_FORM as
  | 'netlify'
  | 'cloudflare'
  | 'vercel'
  | undefined

const config = defineConfig(async ({ mode }) => {
  const HOST =
    mode === 'development'
      ? 'http://localhost:3000'
      : 'https://webhooksh.netlify.app'

  const basePlugins = [
    mdx(await import('./source.config')),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        onSuccess: ({ page }) => {
          console.log(`Pre rendered "${page.path}" done.`)
        },
      },
      pages: [
        {
          path: '/docs',
          prerender: { enabled: true },
        },
      ],
      sitemap: {
        enabled: true,
        host: HOST,
      },
    }),
    tailwindcss(),
    viteReact(),
    mode === 'production' && platform === 'netlify' ? netlify() : [],
    mode === 'production' && platform === 'cloudflare'
      ? cloudflare({ viteEnvironment: { name: 'ssr' } })
      : [],
    mode === 'production' && platform === 'vercel' ? nitro() : [],
  ]

  if (process.env.SENTRY_AUTH_TOKEN) {
    basePlugins.push(
      sentryVitePlugin({
        org: 'convex-tanstack',
        project: 'convex-tanstack',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
    )
  }

  return {
    server: {
      port: 3000,
    },
    plugins: basePlugins,
    nitro: {},
  }
})

export default config
