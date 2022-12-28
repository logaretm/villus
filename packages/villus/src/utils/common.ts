import { isReactive, isRef, Ref, unref } from 'vue';
import { MaybeLazyOrRef, QueryVariables, QueryPredicateOrSignal, MaybeRef } from '../types';

export function unravel<TVars = QueryVariables>(
  signal: QueryPredicateOrSignal<TVars> | undefined,
  vars: MaybeRef<TVars>
) {
  if (isRef(signal)) {
    return signal.value;
  }

  if (typeof signal === 'function') {
    return signal(unref(vars));
  }

  return signal;
}

export function unwrap<TValue>(val: MaybeLazyOrRef<TValue>) {
  if (isRef(val)) {
    return unref(val);
  }

  // TODO: typescript bug to fix here
  return typeof val === 'function' ? (val as any)() : val;
}

export function isWatchable<T>(val: unknown): val is Ref<T> {
  return isRef(val) || isReactive(val) || typeof val === 'function';
}

export function arrayToExistHash<T extends string | number>(items: T[]): Record<string, boolean> {
  return items.reduce((acc, item) => {
    acc[String(item)] = true;

    return acc;
  }, {} as Record<string, boolean>);
}
