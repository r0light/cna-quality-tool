
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import {resolve} from 'node:path'

export default defineConfig({
  plugins: [
    Vue(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    /*
    browser: {
        enabled: true,
        name: 'firefox', // browser name is required,
        headless: true,
      },
      */
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  }
})