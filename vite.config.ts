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
        rewrite: (path) => path.replace(/^\/api\/leakcheck/, ''),
      },
    },
  },
});
