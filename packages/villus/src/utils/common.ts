import { QueryVariables } from 'packages/villus/dist/villus';
import { computed, getCurrentInstance, inject, isReactive, isRef, Ref, unref } from 'vue';
import { getActiveClient, setActiveClient, Client } from '../client';
import { VILLUS_CLIENT } from '../symbols';
import { MaybeLazyOrRef, SkipQuery } from '../types';

export function toWatchableSource<T = any>(value: MaybeLazyOrRef<T> | Record<string, any>): Ref<T> {
  return computed(() => {
    return unwrap(value);
  });
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

export function unwrap<TValue>(val: MaybeLazyOrRef<TValue>) {
  if (isRef(val)) {
    return unref(val);
  }

  // TODO: typescript bug to fix here
  return typeof val === 'function' ? (val as any)() : val;
}

export function isWatchable<T>(val: unknown): val is MaybeLazyOrRef<T> {
  return isRef(val) || isReactive(val) || typeof val === 'function';
}
