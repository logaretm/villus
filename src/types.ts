import { Ref } from 'vue';
import { DocumentNode } from 'graphql';
import { CombinedError } from './utils';

export interface OperationResult<TData = any> {
  data: TData | null;
  error: CombinedError | null;
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

export interface GraphQLResponse<TData> {
  data: TData;
  errors: any;
}
