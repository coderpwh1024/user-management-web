import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后端服务地址（参考 user-management 工程 app/core/config.py）
//   app_host: 0.0.0.0  app_port: 9001
const API_TARGET = 'http://127.0.0.1:9001'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    // 后端未启用 CORS，开发环境通过代理转发，避免跨域问题
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
