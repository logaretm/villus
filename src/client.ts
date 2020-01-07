import { makeCache } from './cache';
import { OperationResult, CachePolicy, Operation, ObservableLike } from './types';
import { normalizeQuery } from './utils';

type Fetcher = typeof fetch;

type FetchOptions = Omit<RequestInit, 'body'>;

interface CachedOperation extends Operation {
  cachePolicy?: CachePolicy;
}

interface GraphQLRequestContext {
  fetchOptions?: FetchOptions;
}

type ContextFactory = () => GraphQLRequestContext;

type SubscriptionForwarder = (operation: Operation) => ObservableLike<OperationResult>;

export interface VqlClientOptions {
  url: string;
  fetch?: Fetcher;
  context?: ContextFactory;
  cachePolicy?: CachePolicy;
  subscriptionForwarder?: SubscriptionForwarder;
}

function resolveGlobalFetch(): Fetcher | undefined {
  if (typeof window !== 'undefined' && 'fetch' in window && window.fetch) {
    return window.fetch.bind(window);
  }

  if (typeof global !== 'undefined' && 'fetch' in global) {
    return (global as any).fetch;
  }

  return undefined;
}

function makeFetchOptions({ query, variables }: Operation, opts: FetchOptions) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('A query must be provided.');
  }

  return {
    method: 'POST',
    body: JSON.stringify({ query: normalizedQuery, variables }),
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...opts.headers
    }
  };
}

interface VqlClientOptionsWithFetcher extends VqlClientOptions {
  fetch: Fetcher;
}

export class VqlClient {
  private url: string;

  private fetch: Fetcher;

  private defaultCachePolicy: CachePolicy;

  private context?: ContextFactory;

  private cache = makeCache();

  private subscriptionForwarder?: SubscriptionForwarder;

  public constructor(opts: VqlClientOptionsWithFetcher) {
    this.url = opts.url;
    this.fetch = opts.fetch;
    this.context = opts.context;
    this.defaultCachePolicy = opts.cachePolicy || 'cache-first';
    this.subscriptionForwarder = opts.subscriptionForwarder;
  }

  public async executeQuery(operation: CachedOperation): Promise<OperationResult> {
    const fetchOptions = this.context ? this.context().fetchOptions : {};
    const opts = makeFetchOptions(operation, fetchOptions || {});
    const policy = operation.cachePolicy || this.defaultCachePolicy;
    const cachedResult = this.cache.getCachedResult(operation);
    if (policy === 'cache-first' && cachedResult) {
      return cachedResult;
    }

    const lazyFetch = () =>
      this.fetch(this.url, opts)
        .then(response => response.json())
        .then(result => {
          if (policy !== 'network-only') {
            this.cache.afterQuery(operation, result);
          }

          return result;
        });

    if (policy === 'cache-and-network' && cachedResult) {
      lazyFetch();

      return cachedResult;
    }

    return lazyFetch();
  }

  public async executeMutation(operation: Operation): Promise<OperationResult> {
    const fetchOptions = this.context ? this.context().fetchOptions : {};
    const opts = makeFetchOptions(operation, fetchOptions || {});

    return this.fetch(this.url, opts).then(response => response.json());
  }

  public executeSubscription(operation: Operation) {
    if (!this.subscriptionForwarder) {
      throw new Error('No subscription forwarder was set.');
    }

    return this.subscriptionForwarder(operation);
  }
}

export function createClient(opts: VqlClientOptions) {
  opts.fetch = opts.fetch || resolveGlobalFetch();
  if (!opts.fetch) {
    throw new Error('Could not resolve a fetch() method, you should provide one.');
  }

  return new VqlClient(opts as VqlClientOptionsWithFetcher);
}
