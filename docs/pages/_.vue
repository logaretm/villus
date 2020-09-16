<template>
  <ContentWrapper :document="page" />
</template>

<script>
import { slugify } from '@/utils/string';

export default {
  async asyncData({ $content, params, store }) {
    const page = await $content(params.pathMatch || 'index').fetch();
    store.commit('SET_DOC', page);

    return {
      page,
    };
  },
  mounted() {
    const linkify = (node) => {
      const anchor = document.createElement('a');
      const slug = slugify(node.textContent);
      anchor.href = `${this.$config.appURL}${this.$route.path}#${slug}`;
      anchor.textContent = node.textContent;
      node.id = slug;
      node.textContent = '';
      node.appendChild(anchor);
    };

    Array.from(this.$el.querySelectorAll('h2')).forEach(linkify);
    Array.from(this.$el.querySelectorAll('h3')).forEach(linkify);
    Array.from(this.$el.querySelectorAll('h4')).forEach(linkify);
  },
  head() {
    return {
      title: this.page.title,
    };
  },
};
</script>
