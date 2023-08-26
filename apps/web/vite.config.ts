import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const accessToken = process.env.VITE_PUBLIC_TELEGRAM_ACCESS_TOKEN;
  const baseUrl = 'https://api.telegram.org';

  return defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        '/api/telegram/getUpdates': {
          target: `${baseUrl}/bot${accessToken}/getUpdates`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/telegram/getUpdates', ''),
        },
        '/api/telegram/getFile': {
          target: `${baseUrl}/bot${accessToken}/getFile`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/telegram/getFile', ''),
        },
        '/api/telegram/downloadFile': {
          target: `${baseUrl}/file/bot${accessToken}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/telegram/downloadFile', ''),
        },
      },
    },
  });
};
