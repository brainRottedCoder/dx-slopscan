import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const DEV_SERVER_PORT = 5173;
const API_PROXY_TARGET = 'http://localhost:3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    port: DEV_SERVER_PORT,
    proxy: {
      '/api': { target: API_PROXY_TARGET, changeOrigin: true },
      '/health': { target: API_PROXY_TARGET, changeOrigin: true },
      '/auth': { target: API_PROXY_TARGET, changeOrigin: true, cookieDomainRewrite: 'localhost' },
    },
  },
});
