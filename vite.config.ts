import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyTarget =
  (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.API_PROXY_TARGET ||
  'https://api.sztufa.xyz'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
