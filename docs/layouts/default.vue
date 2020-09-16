<template>
  <div class="AppWrapper">
    <TheHeader />
    <div class="App" :class="{ 'is-home': isHome }">
      <main class="main">
        <Nuxt />
      </main>

      <div v-if="!isHome" class="lside hidden lg:block">
        <DocMenu class="sticky top-0" />
      </div>

      <div v-if="!isHome" class="rside hidden xl:block">
        <DocToc class="sticky top-0" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    isHome() {
      return this.$store.state.doc && this.$store.state.doc.home;
    },
  },
};
</script>

<style lang="postcss">
.AppWrapper {
  @apply bg-white text-dark w-full h-full min-h-screen;
}

.is-dark {
  .AppWrapper {
    @apply bg-dark text-white;
  }
}

.App:not(.is-home) {
  @apply h-full mx-auto;
  max-width: 1500px;
  grid-template-areas:
    'content'
    'footer';
  display: grid;
  grid-gap: 20px;

  @screen lg {
    grid-template-areas:
      'lside content rside'
      'footer footer footer';
    grid-template-columns: 1.5fr 45rem 0.5fr;
    column-gap: 150px;
  }

  @screen xl {
    grid-template-areas:
      'lside content rside'
      'footer footer footer';
    grid-template-columns: 1fr 45rem 1fr;
  }
}

.App.is-home {
  max-width: 45rem;
  @apply mx-auto;
}

.lside {
  @apply ml-auto;
  grid-area: lside;
}

.main {
  @apply py-12 px-6 min-w-0;

  @screen lg {
    @apply px-0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out, transform 0.2s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translate3d(40%, 0, 0);
}
</style>
