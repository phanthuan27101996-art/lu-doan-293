import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        chunkSizeWarningLimit: 3500,
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'app-icon.jpg'],
          manifest: {
            name: 'Lữ đoàn 293',
            short_name: 'Lữ đoàn 293',
            description: 'Ứng dụng quản lý Lữ đoàn 293',
            theme_color: '#b91c1c',
            background_color: '#fefce8',
            display: 'standalone',
            lang: 'vi',
            start_url: '/',
            icons: [
              {
                src: '/app-icon.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'any',
              },
              {
                src: '/app-icon.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'any',
              },
              {
                src: '/app-icon.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'maskable',
              },
            ],
          },
          minify: false, // tránh lỗi "Unable to write service worker" / terser renderChunk early exit
          workbox: {
            mode: 'development', // không dùng terser khi build SW → tránh lỗi "Unfinished hook (terser) renderChunk"
            globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
            maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB (chunk chính ~5.8 MB)
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
            ],
          },
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          buffer: 'buffer',
        }
      }
    };
});
