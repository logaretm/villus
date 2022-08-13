<template>
  <header class="py-4 sticky top-0 dark:bg-dark bg-white z-20 border-b dark:border-carbon border-gray-700">
    <div class="flex items-center header__content px-6 lg:px-10">
      <div class="mr-auto flex items-baseline">
        <a href="/" class="ml-1 text-accent font-bold">Villus</a>
      </div>

      <AlgoliaSearchBox client:load />

      <SideMenuButton v-model="isMenuOpen" class="ml-auto block lg:hidden relative z-30" />
      <SideMenu v-model="isMenuOpen" />

      <a
        href="https://github.com/logaretm/villus"
        target="_blank"
        rel="noopener"
        class="ml-4 transition-opacity opacity-50 dark:text-white hover:opacity-100 text-dark duration-200 hidden lg:block"
      >
        <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>GitHub</title>
          <path
            d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"
          ></path>
        </svg>
      </a>

      <ThemeSwitcher client:load class="ml-4 hidden lg:flex" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import AlgoliaSearchBox from '@/components/AlgoliaSearchBox.vue';
import SideMenuButton from '@/components/SideMenuButton.vue';
import SideMenu from '@/components/SideMenu.vue';

const isMenuOpen = ref(false);
</script>

<style lang="postcss" scoped>
.header__content {
  max-width: 1300px;
  @apply mx-auto;
}
</style>
