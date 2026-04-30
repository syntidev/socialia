import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
	  base: '/socialia/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/buffer-gql': {
            target: 'https://api.buffer.com',
            changeOrigin: true
          }
        }
      },
      plugins: [react(), tailwindcss(), svgr(), cloudflare()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});