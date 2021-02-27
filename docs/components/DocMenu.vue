<template>
  <aside class="px-6 pt-24">
    <nav class="space-y-8 md:text-sm overflow-y-auto overscroll-y-contain">
      <div v-for="category in categories" :key="category.title">
        <p class="text-xs font-bold text-gray-800 uppercase">
          {{ category.title }}
        </p>
        <ul class="mt-3 space-y-2">
          <li v-for="page in category.pages" :key="page.title">
            <nuxt-link :to="page.path">{{ page.title }}</nuxt-link>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script>
const GROUPS = [
  {
    name: 'guide',
    contentPath: 'guide',
  },
  {
    name: 'plugins',
    contentPath: 'plugins',
  },
  {
    name: 'examples',
    contentPath: 'examples',
  },
  {
    name: 'api reference',
    contentPath: 'api',
  },
];

export default {
  name: 'DocMenu',
  async fetch() {
    const categories = (
      await Promise.all(
        GROUPS.map(group => {
          return this.$content(group.contentPath).only(['title', 'path', 'order', 'group']).fetch();
        })
      )
    ).map((pages, idx) => {
      return {
        title: GROUPS[idx].name,
        pages: pages.sort((a, b) => a.order - b.order),
      };
    });

    this.categories = categories;
  },
  data: () => ({
    categories: [],
  }),
};
</script>

<style lang="postcss" scoped>
nav {
  padding-right: 7px;
  max-height: calc(80vh - 96px);

  a {
    @screen motion {
      transition: color 0.2s ease-in-out;
    }

    &:hover {
      @apply text-accent-800;
    }

    &.nuxt-link-active {
      @apply text-accent-800;
    }
  }

  /* Global Scrollbar styling */
  &::-webkit-scrollbar {
    width: 7px;
    cursor: pointer;
    /*background-color: rgba(229, 231, 235, var(--bg-opacity));*/
  }
  &::-webkit-scrollbar-track {
    background-color: none;
    cursor: pointer;
    /*background: red;*/
  }
  &::-webkit-scrollbar-thumb {
    cursor: pointer;
    background-color: #e8e8e8; /* #E7E5E4; */
    border-radius: 50px;
    /*outline: 1px solid grey;*/
  }
}

.is-dark {
  nav {
    /* Global Scrollbar styling */
    &::-webkit-scrollbar {
      width: 7px;
      cursor: pointer;
      /*background-color: rgba(229, 231, 235, var(--bg-opacity));*/
    }
    &::-webkit-scrollbar-track {
      background-color: none;
      cursor: pointer;
      /*background: red;*/
    }
    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      background-color: #333; /* #E7E5E4; */
      border-radius: 50px;
      /*outline: 1px solid grey;*/
    }
  }
}
</style>
