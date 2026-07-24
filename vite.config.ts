import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// export default defineConfig({
//   server: {
//     port: 3001,
//     host: '0.0.0.0',
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5682',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//       },
//     },
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, '.'),
//     },
//   },
//   build: {
//     chunkSizeWarningLimit: 1000,
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes('node_modules')) {
//             if (id.includes('lucide-react')) return 'lucide';
//             if (id.includes('recharts')) return 'recharts';
//             return 'vendor';
//           }
//         },
//       },
//     },
//   },
// });

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, '.', '');
   
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'lucide';
              if (id.includes('recharts')) return 'recharts';
              return 'vendor';
            }
          },
        },
      },
    },
  }
});