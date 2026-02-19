import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/roblox-users': {
        target: 'https://users.roblox.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roblox-users/, ''),
      },
      '/api/roblox-thumbnails': {
        target: 'https://thumbnails.roblox.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roblox-thumbnails/, ''),
      },
      '/api/roblox-friends': {
        target: 'https://friends.roblox.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roblox-friends/, ''),
      },
      '/api/roblox-groups': {
        target: 'https://groups.roblox.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/roblox-groups/, ''),
      },
      '/api/leakcheck': {
        target: 'https://leakcheck.io/api/v2/query',
        changeOrigin: true,
        secure: false, 
        rewrite: (path) => path.replace(/^\/api\/leakcheck/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // CRITICAL: Set Host header to match target
            proxyReq.setHeader('Host', 'leakcheck.io');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
            proxyReq.setHeader('Referer', 'https://leakcheck.io/');
            proxyReq.setHeader('Origin', 'https://leakcheck.io');
          });
        },
      },
    },
  },
});
