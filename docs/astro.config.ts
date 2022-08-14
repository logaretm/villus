import { join } from 'path';
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import highlight from './highlight';

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === 'production' ? 'https://villus.logaretm.com' : 'http://localhost:3000',
  integrations: [vue(), sitemap()],
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
