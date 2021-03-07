import { nextTick } from 'vue';
import flushPromises from 'flush-promises';

export async function flush() {
  await flushPromises();
  await nextTick();
  await new Promise(resolve => {
    setTimeout(resolve, 100);
  });
  await flushPromises();
}
