import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Explicitly pre-bundle these so the dev server's dependency graph is
  // stable from the first request — letting Vite discover react-router-dom
  // lazily (its default behavior for a freshly-added dependency) has been
  // seen to cause a transient "Invalid hook call" from a duplicated dev-only
  // React binding inside BrowserRouter. Doesn't affect `vite build` output.
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
