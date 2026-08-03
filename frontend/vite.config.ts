import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['chart.js', 'react-chartjs-2'],
          documents: ['jspdf', 'jspdf-autotable', 'xlsx', 'qrcode'],
        },
      },
    },
  },
});
