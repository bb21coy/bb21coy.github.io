import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      react(),
      visualizer({
        open: true,
        filename: 'stats.html'
      })
    ],
    server: {
      host: true,
      port: 5173,
      hmr: {
        host: '192.168.0.189'
      }
    },
    resolve: {
      alias: isProd
        ? {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react/jsx-runtime': 'preact/jsx-runtime'
          }
        : {}
    }
  }
})
