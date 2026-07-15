// @ts-check
import { defineConfig } from 'astro/config';

// Vanilla Three.js ships via Vite; no React island required.
export default defineConfig({
  vite: {
    ssr: {
      // Three is client-only; keep it out of the SSR graph.
      noExternal: [],
    },
    optimizeDeps: {
      include: ['three'],
    },
  },
});
