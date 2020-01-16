import { Ref } from 'vue';
import { DocumentNode } from 'graphql';

export interface OperationResult<TData = any> {
  data: TData;
  errors: any;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first';

export type QueryVariables = Record<string, any>;

export interface Operation<TVars = QueryVariables> {
  query: string | DocumentNode;
  variables?: TVars;
}

export interface ObserverLike<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface Unsub {
  unsubscribe: () => void;
}

/** An abstract observable interface conforming to: https://github.com/tc39/proposal-observable */
export interface ObservableLike<T> {
  subscribe(observer: ObserverLike<T>): Unsub;
}

export type MaybeReactive<T> = T | Ref<T>;
