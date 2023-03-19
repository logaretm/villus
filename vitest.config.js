import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./packages/villus/test/setup.ts'],
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['packages/**/dist/**', '**/test/**', '**/*.d.ts'],
    },
  },
});
