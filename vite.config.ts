/// <reference types="vitest" />
/// <reference types="vite/client" />
import preact from '@preact/preset-vite'
import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // clearScreen: false,
  plugins: [preact(), VitePWA()],
  publicDir: './public',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      '#src': '/src',
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    https: true,
    open: true,
    proxy: {
      '/api': 'http://localhost:5001',
      '/db': {
        target: 'http://localhost:5984',
        // changeOrigin: true,
        rewrite: path => path.slice(3),
        // configure: (proxy, options) => {
        //   // proxy will be an instance of 'http-proxy'
        // }
        cookiePathRewrite: {
          '*': '',
        },
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/lib/testSetup.ts',
  },
})
