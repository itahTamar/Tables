import { defineConfig } from 'vite';
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
    }
});
