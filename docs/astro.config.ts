import { defineConfig } from "astro/config"
import remarkGfm from "remark-gfm"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import vue from "@astrojs/vue"
import highlight from "./highlight"

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === 'production' ? 'https://villus.logaretm.com' : 'http://localhost:3000',
  integrations: [
    vue(),
    sitemap(),
    mdx({
      remarkPlugins: [remarkGfm, highlight],
    }),
  ],
});
