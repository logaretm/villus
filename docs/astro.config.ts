import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import { join } from 'path';
import highlight from './highlight';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  markdown: {
    remarkPlugins: [highlight],
  },
  vite: {
    resolve: {
      alias: {
        '@/': join(__dirname, 'src/'),
      },
    },
  },
});
