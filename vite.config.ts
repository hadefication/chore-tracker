import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true }), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['apple-touch-icon.png'],
    manifest: {
      name: 'Chore Tracker',
      short_name: 'Chores',
      description: 'Track daily chores and earn rewards',
      theme_color: '#ff8f5c',
      background_color: '#fff7f0',
      display: 'standalone',
      start_url: '/',
      orientation: 'any',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      cleanupOutdatedCaches: true,
      navigateFallback: 'index.html'
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: 'index.html',
      type: 'module'
    }
  }), cloudflare()]
})