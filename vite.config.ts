// import { cloudflare } from '@cloudflare/vite-plugin'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig(async ({ mode }) => {
  const HOST =
    mode === 'development'
      ? 'http://localhost:3000'
      : 'https://webhooksh.netlify.app'

  return {
    server: {
      port: 3000,
    },
    plugins: [
      mdx(await import('./source.config')),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      mode === 'production' ? netlify() : [],
      // cloudflareDeployment
      //   ? cloudflare({ viteEnvironment: { name: 'ssr' } })
      //   : [],

      tailwindcss(),
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
      viteReact(),
    ],
  }
})

export default config
