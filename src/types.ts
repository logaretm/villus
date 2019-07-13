export interface OperationResult {
  data: any;
  errors: any;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first';

export interface Operation {
  query: string;
  variables?: { [k: string]: any };
  cachePolicy?: CachePolicy;
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
