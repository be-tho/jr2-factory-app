import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      /* Registro manual en `main.tsx` (`virtual:pwa-register`); no inyectar otro script en index.html. */
      injectRegister: false,
      /* Permite probar SW + manifiesto en `npm run dev` (localhost es contexto seguro). */
      devOptions: {
        enabled: true,
        type: 'module',
      },
      /* Iconos en la raíz de public/; no precachear PNG en el SW (el navegador los pide vía manifiesto). */
      includeManifestIcons: false,
      includeAssets: ['favicon.svg', 'icon-*.png'],
      manifest: {
        name: 'JR2 Moda — Gestión de Fábrica',
        short_name: 'JR2 Moda',
        description: 'Sistema de gestión de inventario y producción para JR2 Moda',
        lang: 'es',
        id: '/',
        categories: ['business', 'productivity'],
        theme_color: '#eb3d63',
        background_color: '#fcf8f9',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Solo cachea assets estáticos del build; las llamadas a Supabase
        // siempre van a la red para no servir datos desactualizados.
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Supabase API → siempre red, sin caché
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
