import { makeCache } from './cache';
import { CombinedError, parseResponse, makeFetchOptions, resolveGlobalFetch } from './utils';
import {
  OperationResult,
  CachePolicy,
  Operation,
  ObservableLike,
  QueryVariables,
  FetchOptions,
  Fetcher
} from './types';

interface CachedOperation<TVars = QueryVariables> extends Operation<TVars> {
  cachePolicy?: CachePolicy;
}

interface GraphQLRequestContext {
  fetchOptions?: FetchOptions;
}

type ContextFactory = () => GraphQLRequestContext | Promise<GraphQLRequestContext>;

type SubscriptionForwarder<TData = any, TVars = QueryVariables> = (
  operation: Operation<TVars>
) => ObservableLike<OperationResult<TData>>;

export interface VqlClientOptions {
  url: string;
  fetch?: Fetcher;
  context?: ContextFactory;
  cachePolicy?: CachePolicy;
  subscriptionForwarder?: SubscriptionForwarder;
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

  /**
   * Executes an operation and returns a normalized response.
   */
  private async execute<TData>(opts: ReturnType<typeof makeFetchOptions>): Promise<OperationResult<TData>> {
    let response;
    try {
      response = await this.fetch(this.url, opts);
    } catch (err) {
      return {
        data: null,
        error: new CombinedError({ response, networkError: err })
      };
    }

    const parsed = await parseResponse<TData>(response);
    if (!parsed.ok || !parsed.body) {
      return {
        data: null,
        error: new CombinedError({ response: parsed, networkError: new Error(parsed.statusText) })
      };
    }

    return {
      data: parsed.body.data,
      error: parsed.body.errors ? new CombinedError({ response: parsed, graphqlErrors: parsed.body.errors }) : null
    };
  }

  public async executeQuery<TData = any, TVars = QueryVariables>(
    operation: CachedOperation<TVars>
  ): Promise<OperationResult> {
    let fetchOptions = null;
    const contextResult = this.context ? this.context() : {};
    if (contextResult instanceof Promise) {
      fetchOptions = (await contextResult).fetchOptions;
    } else {
      fetchOptions = contextResult.fetchOptions;
    }
    const opts = makeFetchOptions(operation, fetchOptions || {});
    const policy = operation.cachePolicy || this.defaultCachePolicy;
    const cachedResult = this.cache.getCachedResult(operation);
    if (policy === 'cache-first' && cachedResult) {
      return cachedResult;
    }

    const cacheResult = (result: OperationResult<TData>) => {
      if (policy !== 'network-only') {
        this.cache.afterQuery(operation, result);
      }

      return result;
    };

    if (policy === 'cache-and-network' && cachedResult) {
      this.execute<TData>(opts).then(cacheResult);

      return cachedResult;
    }

    return this.execute<TData>(opts).then(cacheResult);
  }

  public async executeMutation<TData = any, TVars = QueryVariables>(
    operation: Operation<TVars>
  ): Promise<OperationResult> {
    let fetchOptions = null;
    const contextResult = this.context ? this.context() : {};
    if (contextResult instanceof Promise) {
      fetchOptions = (await contextResult).fetchOptions;
    } else {
      fetchOptions = contextResult.fetchOptions;
    }
    const opts = makeFetchOptions(operation, fetchOptions || {});

    return this.execute<TData>(opts);
  }

  public executeSubscription<TData = any, TVars = QueryVariables>(operation: Operation<TVars>) {
    if (!this.subscriptionForwarder) {
      throw new Error('No subscription forwarder was set.');
    }

    return (this.subscriptionForwarder as SubscriptionForwarder<TData, TVars>)(operation);
  }
}

export function createClient(opts: VqlClientOptions) {
  opts.fetch = opts.fetch || resolveGlobalFetch();
  if (!opts.fetch) {
    throw new Error('Could not resolve a fetch() method, you should provide one.');
  }

  return new VqlClient(opts as VqlClientOptionsWithFetcher);
}
