import { QueryVariables } from 'packages/villus/dist/villus';
import { getCurrentInstance, inject, isReactive, isRef, Ref, toRefs, WatchSource } from 'vue';
import { getActiveClient, setActiveClient, Client } from '../client';
import { VILLUS_CLIENT } from '../symbols';
import { SkipQuery } from '../types';

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

export function resolveClient(): Client {
  const vm = getCurrentInstance() as any;
  // Uses same component provide as its own injections
  // Due to changes in https://github.com/vuejs/vue-next/pull/2424
  let client = vm && inject(VILLUS_CLIENT, vm?.provides?.[VILLUS_CLIENT as any]);

  if (client) setActiveClient(client);
  client = getActiveClient();

  if (client === null || client === undefined) {
    throw new Error(
      'Cannot detect villus Client, did you forget to call `useClient`? Alternatively, you can explicitly pass a client as the `manualClient` argument.'
    );
  }

  return client;
}

export function isSkipped<TVars = QueryVariables>(skip: SkipQuery<TVars>, vars: TVars) {
  if (isRef(skip)) {
    return skip.value;
  }

  return skip(vars);
}
