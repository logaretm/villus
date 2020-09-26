import { cache, CachedOperation } from './cache';
import { DEFAULT_FETCH_OPTS, mergeFetchOpts } from './utils';
import {
  OperationResult,
  CachePolicy,
  Operation,
  ObservableLike,
  QueryVariables,
  FetchOptions,
  Fetcher,
  ClientPlugin,
  ClientPluginContext,
  ClientDoneCallback,
  OperationType,
} from './types';
import { fetch } from './fetch';

type SubscriptionForwarder<TData = any, TVars = QueryVariables> = (
  operation: Operation<TVars>
) => ObservableLike<OperationResult<TData>>;

export interface ClientOptions {
  url: string;
  fetch?: Fetcher;
  cachePolicy?: CachePolicy;
  subscriptionForwarder?: SubscriptionForwarder;
  plugins?: ClientPlugin[];
}

export const defaultPlugins = () => [cache(), fetch()];

export class Client {
  private url: string;

  private defaultCachePolicy: CachePolicy;

  private subscriptionForwarder?: SubscriptionForwarder;

  private plugins: ClientPlugin[];

  public constructor(opts: ClientOptions) {
    this.url = opts.url;
    this.defaultCachePolicy = opts.cachePolicy || 'cache-first';
    this.subscriptionForwarder = opts.subscriptionForwarder;
    this.plugins = opts.plugins || [...defaultPlugins()];
  }

  /**
   * Executes an operation and returns a normalized response.
   */
  private async execute<TData, TVars>(
    operation: Operation<TVars> | CachedOperation<TVars>,
    type: OperationType
  ): Promise<OperationResult<TData>> {
    let result: OperationResult<TData> | undefined;
    let opContext: FetchOptions = { url: this.url, ...DEFAULT_FETCH_OPTS, headers: { ...DEFAULT_FETCH_OPTS.headers } };
    let terminateSignal = false;
    let stopSignal = false;
    const afterQuery: ClientDoneCallback[] = [];

    const context: ClientPluginContext = {
      useResult(pluginResult, terminate, stop) {
        if (terminate) {
          terminateSignal = true;
        }

        if (stop) {
          stopSignal = true;
        }

        result = pluginResult as OperationResult<TData>;
      },
      setOperationContext(ctx) {
        if (!ctx) {
          return opContext;
        }

        opContext = mergeFetchOpts(opContext, ctx);
      },
      afterQuery(cb) {
        afterQuery.push(cb);
      },
      operation: {
        ...operation,
        type,
        cachePolicy:
          ('cachePolicy' in operation ? operation.cachePolicy : this.defaultCachePolicy) || this.defaultCachePolicy,
      },
      opContext,
    };

    let lastI = 0;
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      await plugin(context);
      if (terminateSignal) {
        lastI = i;
        break;
      }
    }

    if (!result) {
      throw new Error(
        'Operation result was not set by any plugin, make sure you have default plugins configured or review documentation'
      );
    }

    return new Promise(resolve => {
      resolve(result);

      (async () => {
        if (!stopSignal) {
          for (let i = lastI + 1; i < this.plugins.length; i++) {
            const plugin = this.plugins[i];
            await plugin(context);
          }
        }

        for (let i = 0; i < afterQuery.length; i++) {
          const afterCb = afterQuery[i];
          await afterCb(result as OperationResult<TData>);
        }
      })();
    });
  }

  public async executeQuery<TData = any, TVars = QueryVariables>(
    operation: CachedOperation<TVars>
  ): Promise<OperationResult> {
    return this.execute<TData, TVars>(operation, 'query');
  }

  public async executeMutation<TData = any, TVars = QueryVariables>(
    operation: Operation<TVars>
  ): Promise<OperationResult> {
    return this.execute<TData, TVars>(operation, 'mutation');
  }

  public executeSubscription<TData = any, TVars = QueryVariables>(operation: Operation<TVars>) {
    if (!this.subscriptionForwarder) {
      throw new Error('No subscription forwarder was set.');
    }

    return (this.subscriptionForwarder as SubscriptionForwarder<TData, TVars>)(operation);
  }
}

export function createClient(opts: ClientOptions) {
  return new Client(opts as ClientOptions);
}
