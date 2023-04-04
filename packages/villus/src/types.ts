import { Ref } from 'vue';
import type { ExecutionResult } from 'graphql';
import { CombinedError } from './utils/error';
import { ParsedResponse, FetchOptions, Operation, QueryVariables } from '../../shared/src';

export interface OperationResult<TData = any> {
  data: TData | null;
  error: CombinedError | null;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first' | 'cache-only';

export type StandardOperationResult<TData = any> = ExecutionResult<TData>;

export type MaybePromise<T> = T | Promise<T>;

export interface ObserverLike<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

export interface Unsubscribable {
  unsubscribe: () => void;
}

/** An abstract observable interface conforming to: https://github.com/tc39/proposal-observable */
export interface ObservableLike<T> {
  subscribe(observer: ObserverLike<T>): Unsubscribable;
}

export type MaybeRef<T> = T | Ref<T>;

export type MaybeLazyOrRef<T> = MaybeRef<T> | (() => T);

export type OperationType = 'query' | 'mutation' | 'subscription';

export type AfterQueryCallback = (
  result: OperationResult,
  ctx: { response?: ParsedResponse<unknown> }
) => void | Promise<void>;

export interface QueryOperation<TData, TVars> extends Operation<TData, TVars> {
  type: 'query';
  cachePolicy?: CachePolicy;
  tags?: string[];
}

export interface MutationOperation<TData, TVars> extends Operation<TData, TVars> {
  type: 'mutation';
  clearCacheTags?: string[];
}

export interface SubscriptionOperation<TData, TVars> extends Operation<TData, TVars> {
  type: 'subscription';
}

export type OperationWithCachePolicy<TData, TVars> =
  | QueryOperation<TData, TVars>
  | MutationOperation<TData, TVars>
  | SubscriptionOperation<TData, TVars>;

export type ClientPluginOperation = OperationWithCachePolicy<unknown, QueryVariables> & {
  key: number;
};

export interface QueryExecutionContext {
  headers: Record<string, string>;
}

export interface ClientPluginContext {
  useResult: (result: OperationResult<unknown>, terminate?: boolean) => void;
  afterQuery: (cb: AfterQueryCallback) => void;
  operation: ClientPluginOperation;
  opContext: FetchOptions;
  response?: ParsedResponse<unknown>;
}

export type ClientPlugin = ({ useResult, operation }: ClientPluginContext) => void | Promise<void>;

export type QueryPredicateOrSignal<TVars = QueryVariables> = boolean | Ref<boolean> | ((variables: TVars) => boolean);
