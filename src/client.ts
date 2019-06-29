import { OperationResult, CachePolicy, Operation } from './types';
import { makeCache } from './cache';

type Fetcher = typeof fetch;

type FetchOptions = Omit<RequestInit, 'body'>;

interface GraphQLRequestContext {
  fetchOptions?: FetchOptions;
}

type ContextFactory = () => GraphQLRequestContext;

interface VqlClientOptions {
  url: string;
  fetch?: Fetcher;
  context?: ContextFactory;
  cachePolicy?: CachePolicy;
}

function resolveGlobalFetch(): Fetcher | undefined {
  // tslint:disable-next-line
  if (typeof window !== 'undefined' && 'fetch' in window) {
    return window.fetch.bind(window);
  }

  // tslint:disable-next-line
  if (typeof global !== 'undefined' && 'fetch' in global) {
    return (global as any).fetch;
  }

  return undefined;
}

function makeFetchOptions({ query, variables }: Operation, opts: FetchOptions) {
  return {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
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

  public constructor(opts: VqlClientOptionsWithFetcher) {
    this.url = opts.url;
    this.fetch = opts.fetch;
    this.context = opts.context;
    this.defaultCachePolicy = opts.cachePolicy || 'cache-first';
  }

  public async query(operation: Operation): Promise<OperationResult> {
    const fetchOptions = this.context ? this.context().fetchOptions : {};
    const opts = makeFetchOptions(operation, fetchOptions || {});
    const policy = operation.cachePolicy || this.defaultCachePolicy;
    let cachedResult = this.cache.getCachedResult(operation);
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
      // tslint:disable-next-line
      lazyFetch();

      return cachedResult;
    }

    return lazyFetch();
  }
}

export function createClient(opts: VqlClientOptions) {
  opts.fetch = opts.fetch || resolveGlobalFetch();
  if (!opts.fetch) {
    throw new Error('Could not resolve a fetch() method, you should provide one.');
  }

  return new VqlClient(opts as VqlClientOptionsWithFetcher);
}
