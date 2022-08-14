<template>
  <iframe
    :src="src"
    style="width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden; margin-top: 40px"
    :title="title"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  ></iframe>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  view: {
    type: String,
    default: undefined,
  },
});

const src = computed(() => {
  return `https://codesandbox.io/embed/${props.id}?fontsize=14&hidenavigation=1&theme=dark${
    props.view ? '&view=' + props.view : ''
  }`;
});
</script>
