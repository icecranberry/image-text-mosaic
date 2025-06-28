import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import postcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  base: '/image-text-mosaic/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  css: {
    postcss: {
      plugins: [
        postcss({
          plugins: {
            tailwindcss: {},
            'postcss-import': {},
            'postcss-nested': {}
          }
        }),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
