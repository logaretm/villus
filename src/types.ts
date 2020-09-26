import { Ref } from 'vue-demi';
import { DocumentNode } from 'graphql';
import { CombinedError } from './utils';
import { CachedOperation } from './cache';

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

export type Fetcher = typeof fetch;

export interface FetchOptions extends RequestInit {
  url?: string;
}

export type OperationType = 'query' | 'mutation' | 'subscription';

type ClientAfterCallback = (result: OperationResult) => void | Promise<void>;

export type ClientDoneCallback = (result: OperationResult) => void | Promise<void>;

export type ClientNextCallback = () => void;

export interface ClientPluginContext {
  useResult: (result: OperationResult<unknown>, terminate?: boolean) => void;
  setOperationContext: (opts: FetchOptions) => void;
  afterQuery: (cb: ClientDoneCallback) => void;
  operation: CachedOperation<unknown> & { type: OperationType };
  opContext: FetchOptions;
}

export type ClientPlugin = ({
  useResult,
  operation,
}: ClientPluginContext) => void | Promise<void> | ClientAfterCallback;
