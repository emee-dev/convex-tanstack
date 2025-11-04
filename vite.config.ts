import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { isDeployedOnCloudflare } from '@/lib/utils'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),

    isDeployedOnCloudflare
      ? cloudflare({ viteEnvironment: { name: 'ssr' } })
      : [],

    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
