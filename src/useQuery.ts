import stringify from 'fast-json-stable-stringify';
import { inject, isReactive, isRef, onMounted, Ref, ref, watch } from 'vue-demi';
import { CachePolicy, MaybeReactive, Operation, OperationResult, QueryVariables } from './types';
import { Client } from './client';
import { hash, CombinedError, toWatchableSource } from './utils';

interface QueryCompositeOptions<TVars> {
  query: MaybeReactive<Operation['query']>;
  variables?: MaybeReactive<TVars>;
  cachePolicy?: CachePolicy;
  lazy?: boolean;
}

interface QueryExecutionOpts {
  cachePolicy?: CachePolicy;
}

export interface QueryComposable<TData> {
  data: Ref<TData | null>;
  error: Ref<CombinedError | null>;
  isFetching: Ref<boolean>;
  isDone: Ref<boolean>;
  execute: (opts?: QueryExecutionOpts) => Promise<OperationResult<TData>>;
  pause: () => void;
  isPaused: Ref<boolean>;
  resume: () => void;
}

interface ThenableQueryComposable<TData> extends QueryComposable<TData> {
  then: (onFulfilled: (value: QueryComposable<TData>) => any) => Promise<QueryComposable<TData>>;
}

function _useQuery<TData, TVars>({
  query,
  variables,
  cachePolicy,
}: QueryCompositeOptions<TVars>): QueryComposable<TData> {
  const client = inject('$villus') as Client;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<TData | null> = ref(null);
  const isFetching = ref(false);
  const isDone = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(overrideOpts: QueryExecutionOpts = {}) {
    isFetching.value = true;
    const vars = (isRef(variables) ? variables.value : variables) || {};
    const res = await client.executeQuery<TData, TVars>({
      query: isRef(query) ? query.value : query,
      variables: vars as TVars, // FIXME: Try to avoid casting
      cachePolicy: overrideOpts?.cachePolicy || cachePolicy,
    });

    data.value = res.data as TData;
    error.value = res.error;
    isDone.value = true;
    isFetching.value = false;

    return { data: data.value, error: error.value };
  }

  if (isRef(query)) {
    watch(query, () => execute());
  }

  let unwatch: ReturnType<typeof watch>;
  const isPaused: Ref<boolean> = ref(false);

  function watchVars() {
    let oldCache: number;
    if ((!isRef(variables) && !isReactive(variables)) || !variables) {
      return;
    }

    const watchableVars = toWatchableSource(variables);
    isPaused.value = false;
    unwatch = watch(
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

  function pause() {
    if (isPaused.value) return;

    unwatch();
    isPaused.value = true;
  }

  function resume() {
    if (!isPaused.value) return;

    watchVars();
  }

  watchVars();

  return { data, isFetching, isDone, error, execute, pause, isPaused, resume };
}

function useQuery<TData = any, TVars = QueryVariables>(
  query: QueryCompositeOptions<TVars>['query'],
  variables?: QueryCompositeOptions<TVars>['variables']
): ThenableQueryComposable<TData>;

function useQuery<TData = any, TVars = QueryVariables>(
  query: QueryCompositeOptions<TVars>
): ThenableQueryComposable<TData>;

function useQuery<TData = any, TVars = QueryVariables>(
  opts: QueryCompositeOptions<TVars> | QueryCompositeOptions<TVars>['query'],
  variables?: QueryCompositeOptions<TVars>['variables']
): ThenableQueryComposable<TData> {
  const normalizedOpts = normalizeOptions(opts, variables);
  const api = _useQuery<TData, TVars>(normalizedOpts);
  // Fetch on mounted if lazy is disabled.
  if (!normalizedOpts.lazy) {
    onMounted(() => {
      api.execute();
    });
  }

  return {
    ...api,
    async then(onFulfilled: (value: any) => any) {
      await api.execute();

      return onFulfilled(api);
    },
  };
}

function normalizeOptions<TVars>(
  opts: QueryCompositeOptions<TVars> | QueryCompositeOptions<TVars>['query'],
  variables?: QueryCompositeOptions<TVars>['variables']
): QueryCompositeOptions<TVars> {
  if (typeof opts !== 'string' && 'query' in opts) {
    return opts;
  }

  return {
    query: opts,
    variables,
  };
}

export { useQuery };
