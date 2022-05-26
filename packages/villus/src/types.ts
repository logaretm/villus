import { Ref } from 'vue';
import type { ExecutionResult } from 'graphql';
import { CombinedError } from './utils/error';
import { ParsedResponse, FetchOptions, Operation } from '../../shared/src';

export interface OperationResult<TData = any> {
  data: TData | null;
  error: CombinedError | null;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first' | 'cache-only';

export type StandardOperationResult<TData = any> = ExecutionResult<TData>;

export type QueryVariables = Record<string, any>;

export interface ObserverLike<T> {
  next?: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

export interface Unsubscribable {
  unsubscribe: () => void;
}

/** An abstract observable interface conforming to: https://github.com/tc39/proposal-observable */
export interface ObservableLike<T> {
  subscribe(observer: ObserverLike<T>): Unsubscribable;
}

export type MaybeRef<T> = T | Ref<T>;

export type OperationType = 'query' | 'mutation' | 'subscription';

export type AfterQueryCallback = (
  result: OperationResult,
  ctx: { response?: ParsedResponse<unknown> }
) => void | Promise<void>;

export interface OperationWithCachePolicy<TData, TVars> extends Operation<TData, TVars> {
  cachePolicy?: CachePolicy;
}

export type ClientPluginOperation = OperationWithCachePolicy<unknown, QueryVariables> & {
  type: OperationType;
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

export type SkipQuery<TVars = QueryVariables> = Ref<boolean> | ((variables: TVars) => boolean);
