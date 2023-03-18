import { arrayToExistHash, getQueryKey } from './utils';
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
  QueryOperation,
  MutationOperation,
  SubscriptionOperation,
  ClientPluginOperation,
} from './types';
import { VILLUS_CLIENT } from './symbols';
import { App, getCurrentInstance, inject, InjectionKey } from 'vue';

export interface ClientOptions {
  url: string;
  cachePolicy?: CachePolicy;
  use?: ClientPlugin[];
}

/**
 * setActiveClient should be called to solve problem outside setup
 */
// eslint-disable-next-line no-use-before-define
let activeClient: Client | undefined;

/**
 * Sets or unsets the active client
 *
 * @param client - villus client instance
 */
export const setActiveClient = (client: Client | undefined) => (activeClient = client);

/**
 * Get the currently active client if there is any.
 */
export const getActiveClient = () => {
  const vm = getCurrentInstance() as any;
  if (!vm) {
    return activeClient;
  }

  return vm.provides?.[VILLUS_CLIENT as any] || inject(VILLUS_CLIENT, activeClient);
};

type OnResultChangedCallback<TData> = (result: OperationResult<TData>) => unknown;

export const defaultPlugins = () => [cache(), dedup(), fetch()];

interface TaggedQueryEntry {
  id: symbol;
  refetch(): Promise<void>;
  tags: string[];
}

export class Client {
  public install: (app: App) => void = () => undefined;

  private url: string;

  private defaultCachePolicy: CachePolicy;

  private plugins: ClientPlugin[];

  private taggedQueries: TaggedQueryEntry[];

  public constructor(opts: ClientOptions) {
    this.url = opts.url;
    this.defaultCachePolicy = opts.cachePolicy || 'cache-first';
    this.plugins = opts.use || [...defaultPlugins()];
    this.taggedQueries = [];
  }

  /**
   * Executes an operation and returns a normalized response.
   */
  private async execute<TData, TVars>(
    operation: Operation<TData, TVars> | OperationWithCachePolicy<TData, TVars>,
    type: OperationType,
    queryContext?: QueryExecutionContext,
    onResultChanged?: OnResultChangedCallback<TData>
  ): Promise<OperationResult<TData>> {
    let result: OperationResult<TData> | undefined;
    const opContext: FetchOptions = {
      url: this.url,
      ...DEFAULT_FETCH_OPTS,
      headers: { ...DEFAULT_FETCH_OPTS.headers, ...(queryContext?.headers || {}) },
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
      } as ClientPluginOperation,
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
    operation: Omit<QueryOperation<TData, TVars>, 'type'>,
    queryContext?: QueryExecutionContext,
    onResultChanged?: OnResultChangedCallback<TData>
  ): Promise<OperationResult<TData>> {
    return this.execute<TData, TVars>(operation, 'query', queryContext, onResultChanged);
  }

  public async executeMutation<TData = any, TVars = QueryVariables>(
    operation: Omit<MutationOperation<TData, TVars>, 'type'>,
    queryContext?: QueryExecutionContext
  ): Promise<OperationResult<TData>> {
    return this.execute<TData, TVars>(operation, 'mutation', queryContext);
  }

  public async executeSubscription<TData = any, TVars = QueryVariables>(
    operation: Omit<SubscriptionOperation<TData, TVars>, 'type'>
  ) {
    const result = await this.execute<TData, TVars>(operation, 'subscription');

    return result as unknown as ObservableLike<StandardOperationResult<TData>>;
  }

  public registerTaggedQuery(tags: string[], refetch: () => Promise<void>): symbol {
    const id = Symbol('Tagged query');

    this.taggedQueries.push({ id, tags, refetch });

    return id;
  }

  public unregisterTaggedQuery(id: symbol) {
    const idx = this.taggedQueries.findIndex(tq => tq.id === id);
    if (idx === -1) {
      return;
    }

    this.taggedQueries.splice(idx, 1);
  }

  public async refetchTaggedQueries(tags: string[]) {
    const tagsLookup = arrayToExistHash(tags);

    const queries = this.taggedQueries.filter(tq => {
      return tq.tags.some(t => tagsLookup[t]);
    });

    return Promise.all(queries.map(q => q.refetch())).then(() => undefined);
  }
}

export function createClient(opts: ClientOptions) {
  const client = new Client(opts);
  client.install = (app: App) => {
    // this allows useQuery() etc useFunctions to get client outside of a component setup after
    setActiveClient(client);
    app.provide(VILLUS_CLIENT, client);
  };
  return client;
}

function resolveInternalInjection<T>(vm: any, symbol: InjectionKey<T>) {
  // Vue 2 uses `proxy._provided` while Vue 3 has `provides`
  // Vue 2.7's proxy property might be a bug but thats the IRL situation.
  return vm?.proxy?._provided?.[symbol as any] || vm?._provided?.[symbol as any] || vm?.provides?.[symbol as any];
}

export function resolveClient(): Client {
  const vm = getCurrentInstance() as any;
  // Uses same component provide as its own injections
  // Due to changes in https://github.com/vuejs/vue-next/pull/2424
  let client = vm && inject(VILLUS_CLIENT, resolveInternalInjection(vm, VILLUS_CLIENT));

  if (client) setActiveClient(client);
  client = getActiveClient();

  if (client === null || client === undefined) {
    throw new Error(
      'Cannot detect villus Client, did you forget to call `useClient`? Alternatively, you can explicitly pass a client as the `manualClient` argument.'
    );
  }

  return client;
}
