<template>
  <div class="relative mt-4">
    <div class="bg-gradient-to-b from-gray-700 to-transparent h-4 absolute top-0 inset-x-0"></div>
    <nav class="py-4 space-y-8 md:text-sm overflow-y-auto overscroll-y-contain px-4">
      <div v-for="category in menu" :key="category.title">
        <p class="text-xs font-bold text-gray-800 dark:text-gray-400 uppercase">
          {{ category.title }}
        </p>
        <ul class="mt-3 space-y-2">
          <li v-for="page in category.pages" :key="page.title">
            <a :href="page.path" :aria-current="page.path === currentUrl ? 'page' : undefined">{{ page.title }}</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="bg-gradient-to-b from-transparent to-gray-700 h-4 absolute bottom-0 inset-x-0"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  menu: { title: string; pages: any[] }[];
  currentUrl: string;
}>();
</script>

<style lang="postcss" scoped>
nav {
  max-height: calc(80vh - 96px);

  a {
    @apply cursor-pointer;
    @screen motion {
      transition: color 0.2s ease-in-out;
    }

    &:hover {
      @apply text-accent-800;
    }

    &[aria-current='page'] {
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

.dark {
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
