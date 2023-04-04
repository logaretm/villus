import { isRef, onMounted, Ref, ref, unref, watch, getCurrentInstance, onBeforeUnmount } from 'vue';
import stringify from 'fast-json-stable-stringify';
import {
  CachePolicy,
  MaybeLazyOrRef,
  MaybeRef,
  OperationResult,
  QueryExecutionContext,
  QueryPredicateOrSignal,
} from './types';
import { hash, CombinedError, unwrap, isWatchable, unravel, useCallback } from './utils';
import { Operation, QueryVariables } from '../../shared/src';
import { Client, resolveClient } from './client';

export interface QueryCompositeOptions<TData, TVars> {
  query: MaybeRef<Operation<TData, TVars>['query']>;
  variables?: MaybeLazyOrRef<TVars>;
  context?: MaybeRef<QueryExecutionContext>;
  cachePolicy?: CachePolicy;
  fetchOnMount?: boolean;
  client?: Client;
  paused?: QueryPredicateOrSignal<TVars>;
  skip?: QueryPredicateOrSignal<TVars>;
  tags?: string[];
  onData?: (data: TData) => void;
  onError?: (err: CombinedError) => void;
}

export interface QueryExecutionOpts<TVars> {
  cachePolicy: CachePolicy;
  variables: TVars;
}

export type DataHookHandler<TData> = (data: TData) => unknown;
export type ErrorHookHandler = (error: CombinedError) => unknown;

type UnregisterHookFn = () => void;

export interface BaseQueryApi<TData = any, TVars = QueryVariables> {
  data: Ref<TData | null>;
  isFetching: Ref<boolean>;
  isDone: Ref<boolean>;
  error: Ref<CombinedError | null>;
  onData(handler: DataHookHandler<TData>): UnregisterHookFn;
  onError(handler: ErrorHookHandler): UnregisterHookFn;
  execute(
    overrideOpts?: Partial<QueryExecutionOpts<TVars>>
  ): Promise<{ data: TData | null; error: CombinedError | null }>;
}

export interface QueryApi<TData, TVars> extends BaseQueryApi<TData, TVars> {
  then(onFulfilled: (value: BaseQueryApi<TData, TVars>) => any): Promise<BaseQueryApi<TData, TVars>>;
}

function useQuery<TData = any, TVars = QueryVariables>(
  opts: QueryCompositeOptions<TData, TVars>
): QueryApi<TData, TVars> {
  const client = opts?.client ?? resolveClient();
  if (opts.tags) {
    const id = client.registerTaggedQuery(opts.tags, async () => {
      await execute();
    });

    onBeforeUnmount(() => {
      client.unregisterTaggedQuery(id);
    });
  }

  const {
    query,
    variables,
    cachePolicy,
    fetchOnMount,
    paused,
    skip,
    onData: dataHook,
    onError: errorHook,
  } = normalizeOptions(opts);
  let currentFetchOnMount = fetchOnMount;
  const data: Ref<TData | null> = ref(null);
  const isFetching = ref<boolean>(fetchOnMount ?? false);
  const isDone = ref(false);
  const isStale = ref(true);
  const error: Ref<CombinedError | null> = ref(null);

  const { on: onData, run: executeDataHooks } = useCallback<DataHookHandler<TData>>();
  const { on: onError, run: executeErrorHooks } = useCallback<ErrorHookHandler>();

  if (dataHook) {
    onData(dataHook);
  }

  if (errorHook) {
    onError(errorHook);
  }

  // This is to prevent state mutation for racing requests, basically favoring the very last one
  let lastPendingOperation: Promise<OperationResult<TData>> | undefined;
  const isCurrentlyPaused = () => unravel(paused, (variables || {}) as TVars);

  function onResultChanged(result: OperationResult<TData>) {
    if (result.data) {
      executeDataHooks(result.data);
    }

    if (result.error) {
      executeErrorHooks(result.error);
    }

    data.value = result.data as TData;
    error.value = result.error;
  }

  async function execute(overrideOpts?: Partial<QueryExecutionOpts<TVars>>) {
    const vars = unwrap(variables) || ({} as TVars);
    // result won't change if execution is skipped
    if (unravel(skip, vars)) {
      isFetching.value = false;

      return {
        data: data.value,
        error: error.value,
      };
    }

    isFetching.value = true;
    const pendingExecution = client.executeQuery<TData, TVars>(
      {
        query: isRef(query) ? query.value : query,
        variables: unwrap(overrideOpts?.variables || vars),
        cachePolicy: overrideOpts?.cachePolicy || cachePolicy,
        tags: opts?.tags,
      },
      unref(opts?.context),
      onResultChanged
    );

    lastPendingOperation = pendingExecution;
    const res = await pendingExecution;
    // Avoid state mutation if the pendingExecution isn't the last pending operation
    if (pendingExecution !== lastPendingOperation) {
      // we still return this result to preserve the integrity of "execute" calls
      return { data: res.data as TData, error: res.error };
    }

    onResultChanged(res);
    isDone.value = true;
    isFetching.value = false;
    isStale.value = false;
    lastPendingOperation = undefined;

    return { data: data.value, error: error.value };
  }

  function executeIfNotPaused() {
    const isPaused = isCurrentlyPaused();
    if (!isPaused) {
      execute();
    }
  }

  if (isRef(query)) {
    watch(query, executeIfNotPaused);
  }

  if (isWatchable<boolean>(paused)) {
    watch(
      () => !isCurrentlyPaused(),
      shouldExecute => {
        if (shouldExecute && isStale.value) {
          execute();
        }
      }
    );
  }

  function initVarWatchers() {
    let oldCache: number;
    if (!variables || !isWatchable(variables)) {
      return;
    }

    watch(
      () => unwrap(variables),
      newValue => {
        const id = hash(stringify(newValue));
        // prevents duplicate queries.
        if (id === oldCache) {
          return;
        }

        oldCache = id;
        isStale.value = true;
        executeIfNotPaused();
      },
      { deep: true }
    );
  }

  initVarWatchers();

  const api = { data, isFetching, isDone, error, execute, onData, onError };

  /**
   * if can not getCurrentInstance, the func use outside of setup, cannot get onMounted
   * when outside of setup and fetchOnMount is true, execute immediately, but a little confused
   * todo: maybe better to add a new param decide execute immediately, but it's ok also now
   */
  const vm = getCurrentInstance();
  if (currentFetchOnMount) {
    if (!paused || !isCurrentlyPaused()) {
      vm ? onMounted(() => execute()) : execute();
    }
  }

  return {
    ...api,
    async then(onFulfilled: (value: BaseQueryApi<TData, TVars>) => any): Promise<BaseQueryApi<TData, TVars>> {
      currentFetchOnMount = false;
      await api.execute();

      return onFulfilled(api);
    },
  };
}

function normalizeOptions<TData, TVars>(
  opts: Partial<QueryCompositeOptions<TData, TVars>>
): QueryCompositeOptions<TData, TVars> {
  const defaultOpts = {
    variables: {} as TVars,
    fetchOnMount: true,
  };

  return {
    ...defaultOpts,
    ...opts,
    query: opts.query as NonNullable<(typeof opts)['query']>,
  };
}

export { useQuery };
