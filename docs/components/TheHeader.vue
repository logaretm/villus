<template>
  <header class="py-4 sticky top-0 dark-mode:bg-dark bg-white z-20 border-b dark-mode:border-carbon border-gray-700">
    <div class="flex items-center header__content px-6 lg:px-10">
      <div class="mr-auto flex items-baseline">
        <!-- <img class="h-6 w-auto" src="@/assets/img/logo_red.png" /> -->
        <span class="ml-1 text-accent font-bold">Docs</span>
      </div>

      <SideMenuButton v-model="isMenuOpen" class="ml-auto block lg:hidden relative z-30" />
      <SideMenu v-model="isMenuOpen" />

      <ThemeSwitcher class="ml-4 hidden lg:flex" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  data: () => ({
    isMenuOpen: false,
  }),
};
</script>

<style lang="postcss" scoped>
.header__content {
  max-width: 1300px;
  @apply mx-auto;
}
</style>
