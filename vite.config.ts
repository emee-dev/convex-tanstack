// import { cloudflare } from '@cloudflare/vite-plugin'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { sentryVitePlugin } from '@sentry/vite-plugin'

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
    mode === 'production' ? netlify() : [],
  ]

  if (process.env.SENTRY_AUTH_TOKEN) {
    basePlugins.push(
      sentryVitePlugin({
        org: 'convex-tanstack',
        project: 'convex-tanstack',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
    )
  }

  return {
    server: {
      port: 3000,
    },
    plugins: basePlugins,
  }
})

export default config
