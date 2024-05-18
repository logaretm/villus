import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import highlight from './src/highlight';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === 'production' ? 'https://villus.dev' : 'http://localhost:3000',
  integrations: [
    vue(),
    sitemap(),
    mdx({
      remarkPlugins: [remarkGfm, highlight],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
