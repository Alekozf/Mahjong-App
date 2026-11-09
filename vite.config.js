import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes every asset URL relative, so the build works at any GitHub Pages
// repository path (https://<user>.github.io/<repo>/) without hard-coding the repo name.
// Hash routing means no server rewrites are needed for deep links or refresh.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
