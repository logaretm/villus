import { getQueryKey } from './utils';
import { cache } from './cache';
import { fetch } from './fetch';
import { dedup } from './dedup';
import { DEFAULT_FETCH_OPTS, FetchOptions, Operation } from '../../shared/src';
import {
  OperationResult,
  CachePolicy,
  QueryVariables,
  ClientPlugin,
  ClientPluginContext,
  OperationType,
  AfterQueryCallback,
  ObservableLike,
  OperationWithCachePolicy,
  StandardOperationResult,
  QueryExecutionContext,
} from './types';
import { VILLUS_CLIENT } from './symbols';
import { App } from 'vue';

export interface ClientOptions {
  url: string;
  cachePolicy?: CachePolicy;
  use?: ClientPlugin[];
}

type OnResultChangedCallback<TData> = (result: OperationResult<TData>) => unknown;

export const defaultPlugins = () => [cache(), dedup(), fetch()];

export class Client {
  public install: (app: App) => void = () => undefined;

  private url: string;

  private defaultCachePolicy: CachePolicy;

  private plugins: ClientPlugin[];

  public constructor(opts: ClientOptions) {
    this.url = opts.url;
    this.defaultCachePolicy = opts.cachePolicy || 'cache-first';
    this.plugins = opts.use || [...defaultPlugins()];
  }

  /**
   * Executes an operation and returns a normalized response.
   */
  private async execute<TData, TVars>(
    operation: Operation<TData, TVars> | OperationWithCachePolicy<TData, TVars>,
    type: OperationType,
    queryContext?: Partial<QueryExecutionContext>,
    onResultChanged?: OnResultChangedCallback<TData>
  ): Promise<OperationResult<TData>> {
    let result: OperationResult<TData> | undefined;
    const opContext: FetchOptions = {
      url: this.url,
      ...DEFAULT_FETCH_OPTS,
      headers: { ...DEFAULT_FETCH_OPTS.headers, ...(queryContext?.headers || {}) },
      signal: queryContext?.signal,
    };

    let terminateSignal = false;
    const afterQuery: AfterQueryCallback[] = [];

    const context: ClientPluginContext = {
      useResult(pluginResult, terminate) {
        if (terminate) {
          terminateSignal = true;
        }

        // this means the `useResult` was called multiple times
        if (result) {
          onResultChanged?.(pluginResult as OperationResult<TData>);
        }

        result = pluginResult as OperationResult<TData>;
      },
      afterQuery(cb) {
        afterQuery.push(cb);
      },
      operation: {
        ...operation,
        key: getQueryKey(operation),
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
      if (result) {
        lastI = i;
        break;
      }
    }

    return new Promise((resolve, reject) => {
      if (!result) {
        reject(
          new Error(
            'Operation result was not set by any plugin, make sure you have default plugins configured or review documentation'
          )
        );
        return;
      }

      resolve(result);

      (async () => {
        if (!terminateSignal) {
          for (let i = lastI + 1; i < this.plugins.length; i++) {
            const plugin = this.plugins[i];
            await plugin(context);
          }
        }

        const afterQueryCtx = { response: context.response };
        for (let i = 0; i < afterQuery.length; i++) {
          const afterCb = afterQuery[i];
          await afterCb(result as OperationResult<TData>, afterQueryCtx);
        }
      })();
    });
  }

  public async executeQuery<TData = any, TVars = QueryVariables>(
    operation: OperationWithCachePolicy<TData, TVars>,
    queryContext?: Partial<QueryExecutionContext>,
    onResultChanged?: OnResultChangedCallback<TData>
  ): Promise<OperationResult<TData>> {
    return this.execute<TData, TVars>(operation, 'query', queryContext, onResultChanged);
  }

  public async executeMutation<TData = any, TVars = QueryVariables>(
    operation: Operation<TData, TVars>,
    queryContext?: Partial<QueryExecutionContext>
  ): Promise<OperationResult<TData>> {
    return this.execute<TData, TVars>(operation, 'mutation', queryContext);
  }

  public async executeSubscription<TData = any, TVars = QueryVariables>(operation: Operation<TData, TVars>) {
    const result = await this.execute<TData, TVars>(operation, 'subscription');

    return result as unknown as ObservableLike<StandardOperationResult<TData>>;
  }
}

export function createClient(opts: ClientOptions) {
  const client = new Client(opts);
  client.install = (app: App) => app.provide(VILLUS_CLIENT, client);
  return client;
}
