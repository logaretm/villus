import { isReactive, isRef, Ref, toRefs, WatchSource } from 'vue';

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
