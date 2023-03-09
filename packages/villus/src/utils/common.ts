import { isReactive, isRef, Ref, unref, nextTick } from 'vue';
import { MaybeLazyOrRef, QueryVariables, QueryPredicateOrSignal, MaybeRef } from '../types';
import stringify from 'fast-json-stable-stringify';

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

export function debounceAsync<TFunction extends (...args: any) => Promise<any>, TResult = ReturnType<TFunction>>(
  inner: TFunction
): (...args: Parameters<TFunction>) => Promise<TResult> {
  let resolves: any[] = [];
  let ticking = false;

  return function (...args: Parameters<TFunction>) {
    if (!ticking) {
      nextTick(() => {
        const result = inner(...(args as any));
        resolves.forEach(r => r(result));
        resolves = [];
        ticking = false;
      });

      ticking = true;
    }

    return new Promise<TResult>(resolve => resolves.push(resolve));
  };
}

export function isEqual(lhs: unknown, rhs: unknown) {
  return stringify(lhs) === stringify(rhs);
}
