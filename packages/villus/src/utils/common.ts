import { getCurrentInstance, inject, InjectionKey, isReactive, isRef, Ref, toRefs, WatchSource } from 'vue-demi';

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
export function injectWithSelf<T>(symbol: InjectionKey<T>, onMissing: () => Error): T {
  const vm = getCurrentInstance() as any;

  const injection = inject(symbol, vm?.provides[symbol as any]);
  if (injection === null || injection === undefined) {
    throw onMissing();
  }

  return injection;
}
