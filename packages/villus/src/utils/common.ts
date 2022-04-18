import { getCurrentInstance, inject, InjectionKey, isReactive, isRef, Ref, toRefs, WatchSource } from 'vue';
import { getActiveClient, setActiveClient, Client } from '../client';

export function toWatchableSource<T = any>(value: Ref<T> | Record<string, any>): WatchSource | WatchSource[] {
  if (isRef(value)) {
    return value;
  }

  if (isReactive(value)) {
    const refs = toRefs(value);

    return Object.keys(refs).map(refKey => refs[refKey]);
  }

  throw new Error('value is not reactive');
}

// Uses same component provide as its own injections
// Due to changes in https://github.com/vuejs/vue-next/pull/2424
export function resolveClient<T>(symbol: InjectionKey<T>): Client {
  const vm = getCurrentInstance() as any;
  let client = vm && inject(symbol, vm?.provides?.[symbol as any]);

  if (client) setActiveClient(client);
  client = getActiveClient();

  if (client === null || client === undefined) {
    throw new Error(
      'Cannot detect villus Client, did you forget to call `useClient`? Alternatively, you can explicitly pass a client as the `manualClient` argument.'
    );
  }

  return client;
}
