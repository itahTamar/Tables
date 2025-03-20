import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    hmr: false, // Disable Hot Module Replacement for better error tracking
  },
  build: {
    outDir: 'dist', // Specify the output directory
    emptyOutDir: true // Ensure the directory is emptied before each build
  }
});

