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
        target: 'https://backend-68d5.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/leakcheck/, '/leakcheck'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error to Render backend:', err);
          });
        },
      },
    },
  },
});
