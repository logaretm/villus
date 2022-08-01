import { isRef, onMounted, Ref, ref, unref, watch, getCurrentInstance } from 'vue';
import stringify from 'fast-json-stable-stringify';
import {
  CachePolicy,
  MaybeLazyOrRef,
  MaybeRef,
  OperationResult,
  QueryExecutionContext,
  QueryVariables,
  SkipQuery,
} from './types';
import { hash, CombinedError, toWatchableSource, isSkipped, unwrap, isWatchable } from './utils';
import { Operation } from '../../shared/src';
import { Client, resolveClient } from './client';

export interface QueryCompositeOptions<TData, TVars> {
  query: MaybeRef<Operation<TData, TVars>['query']>;
  variables?: MaybeLazyOrRef<TVars>;
  context?: MaybeRef<QueryExecutionContext>;
  cachePolicy?: CachePolicy;
  fetchOnMount?: boolean;
  client?: Client;
  skip?: SkipQuery<TVars>;
}

interface QueryExecutionOpts<TVars> {
  cachePolicy: CachePolicy;
  variables: TVars;
}

export interface BaseQueryApi<TData = any, TVars = QueryVariables> {
  data: Ref<TData | null>;
  isFetching: Ref<boolean>;
  isDone: Ref<boolean>;
  error: Ref<CombinedError | null>;
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

  let { query, variables, cachePolicy, fetchOnMount } = normalizeOptions(opts);
  const data: Ref<TData | null> = ref(null);
  const isFetching = ref<boolean>(fetchOnMount ?? false);
  const isDone = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  // This is to prevent state mutation for racing requests, basically favoring the very last one
  let lastPendingOperation: Promise<OperationResult<TData>> | undefined;

  function onResultChanged(result: OperationResult<TData>) {
    data.value = result.data as TData;
    error.value = result.error;
  }

  async function execute(overrideOpts?: Partial<QueryExecutionOpts<TVars>>) {
    const vars = unwrap(variables) || ({} as TVars);
    // result won't change if execution is skipped
    if (opts.skip && isSkipped(opts.skip, vars)) {
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
    lastPendingOperation = undefined;

    return { data: data.value, error: error.value };
  }

  if (isRef(query)) {
    watch(query, () => execute());
  }

  const isWatchingVariables: Ref<boolean> = ref(false);

  function initVarWatchers() {
    let oldCache: number;
    if (!variables || !isWatchable(variables)) {
      return;
    }

    const watchableVars = toWatchableSource(variables);
    isWatchingVariables.value = true;
    watch(
      watchableVars,
      newValue => {
        const id = hash(stringify(newValue));
        // prevents duplicate queries.
        if (id === oldCache) {
          return;
        }

        oldCache = id;
        execute();
      },
      { deep: true }
    );
  }

  initVarWatchers();

  const api = { data, isFetching, isDone, error, execute, isWatchingVariables };

  /**
   * if can not getCurrentInstance, the func use outside of setup, cannot get onMounted
   * when outside of setup and fetchOnMount is true, execute immediately, but a little confused
   * todo: maybe better to add a new param decide execute immediately, but it's ok also now
   */
  const vm = getCurrentInstance();
  if (fetchOnMount) {
    vm ? onMounted(() => execute()) : execute();
  }

  return {
    ...api,
    async then(onFulfilled: (value: BaseQueryApi<TData, TVars>) => any): Promise<BaseQueryApi<TData, TVars>> {
      fetchOnMount = false;
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
    query: opts.query as NonNullable<typeof opts['query']>,
  };
}

export { useQuery };
