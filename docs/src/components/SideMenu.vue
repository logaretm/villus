<template>
  <transition name="slide">
    <div v-if="isOpen" class="SideMenu lg:hidden">
      <DocMenu />
    </div>
  </transition>
</template>

<script setup lang="ts">
import DocMenu from '@/components/DocMenu.vue';
import { watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.isOpen,
  val => {
    document.body.classList.toggle('overflow-hidden', val);
  }
);
</script>

<style lang="postcss" scoped>
.SideMenu {
  @apply fixed h-screen w-screen inset-0 z-20 overflow-y-auto bg-white text-dark flex flex-col;
}

.dark {
  .SideMenu {
    @apply bg-dark text-white;
  }
}

@screen motion {
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;
  }
  .slide-enter,
  .slide-leave-to {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
}

nav {
  a {
    transition: color 0.3s ease-in-out;

    &::-moz-focus-inner {
      border: 0;
    }

    &:hover {
      @apply text-accent-800;
    }

    &:focus {
      @apply text-accent-800;
      outline: 2px dotted currentColor;
      outline-offset: 2px;
    }

    &::after {
      @apply absolute inset-0 w-full h-full;
      border: 6px solid transparent;
      transition: border-color 0.3s ease-in-out;
      content: '';
    }

    &.active {
      &::after {
        transition: border-color 0.3s ease-in-out;

        @apply border-accent-800;
      }
    }
  }
}

.FeedLink {
  min-width: 48px;
  min-height: 48px;
}
</style>
