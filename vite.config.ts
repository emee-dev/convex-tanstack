import { cloudflare } from '@cloudflare/vite-plugin'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import Unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { cloudflareDeployment, isDev } from './src/lib/utils'

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    mdx(await import('./source.config')),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    isDev ? [] : netlify(),
    // cloudflareDeployment
    //   ? cloudflare({ viteEnvironment: { name: 'ssr' } })
    //   : [],
    tailwindcss(),
    // Unfonts({
    //   custom: {
    //     preload: true,
    //     families: [
    //       {
    //         name: 'Geist',
    //         local: 'Geist',
    //         src: './src/assets/Geist/webfonts/*.woff2',
    //       },
    //       {
    //         name: 'GeistMono',
    //         local: 'GeistMono',
    //         src: './src/assets/GeistMono/webfonts/*.woff2',
    //       },
    //     ],
    //   },
    // }),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    viteReact(),
  ],
})

export default config
