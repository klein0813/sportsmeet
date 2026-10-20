import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: true,
    proxy: {
      '/ex': {
        target: 'http://172.16.50.65:31245',
        changeOrigin: true,
        // 剔除 /api 前缀，把真正的请求发给后端
        rewrite: (path) => path.replace(/^\/ex/, '') 
      }
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: ['editor-for-vue'],
})
