import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./packages/villus/test/setup.ts'],
    environment: 'jsdom',
  },
});
