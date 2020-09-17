import stringify from 'fast-json-stable-stringify';
import { inject, isRef, onMounted, Ref, ref, watch } from 'vue-demi';
import { CachePolicy, MaybeReactive, Operation, QueryVariables } from './types';
import { VqlClient } from './client';
import { hash, CombinedError } from './utils';

interface QueryCompositeOptions<TVars> {
  query: MaybeReactive<Operation['query']>;
  variables?: MaybeReactive<TVars>;
  cachePolicy?: CachePolicy;
  lazy?: boolean;
}

function _useQuery<TData, TVars>({ query, variables, cachePolicy }: QueryCompositeOptions<TVars>) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data = ref<TData | null>(null);
  const fetching = ref(false);
  const done = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(overrideOpts: { cachePolicy?: CachePolicy } = {}) {
    fetching.value = true;
    const vars = (isRef(variables) ? variables.value : variables) || {};
    const res = await client.executeQuery<TData, TVars>({
      query: isRef(query) ? query.value : query,
      variables: vars as TVars, // FIXME: Try to avoid casting
      cachePolicy: overrideOpts?.cachePolicy || cachePolicy,
    });

    data.value = res.data;
    error.value = res.error;
    done.value = true;
    fetching.value = false;

    return { data: data.value, error: error.value };
  }

  if (isRef(query)) {
    watch(query, () => execute());
  }

  let unwatch: ReturnType<typeof watch>;
  const paused: Ref<boolean> = ref(false);

  function watchVars() {
    let oldCache: number;
    if (!isRef(variables)) {
      return;
    }

    paused.value = false;
    unwatch = watch(
      variables,
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
    if (paused.value) return;

    unwatch();
    paused.value = true;
  }

  function resume() {
    if (!paused.value) return;

    watchVars();
  }

  watchVars();

  return { data, fetching, done, error, execute, pause, paused, resume };
}

type QueryComposable = ReturnType<typeof _useQuery>;

function useQuery<TData = any, TVars = QueryVariables>(
  opts: QueryCompositeOptions<TVars> | QueryCompositeOptions<TVars>['query']
): QueryComposable {
  const normalizedOpts = normalizeOptions(opts);
  const api = _useQuery<TData, TVars>(normalizedOpts);
  // Fetch on mounted if lazy is disabled.
  if (!normalizedOpts.lazy) {
    onMounted(() => {
      api.execute();
    });
  }

  return api;
}

function useQueryAsync<TData = any, TVars = QueryVariables>(
  query: QueryCompositeOptions<TVars>['query'],
  variables?: QueryCompositeOptions<TVars>['variables']
): Promise<QueryComposable>;

function useQueryAsync<TData = any, TVars = QueryVariables>(
  query: QueryCompositeOptions<TVars>
): Promise<QueryComposable>;

async function useQueryAsync<TData = any, TVars = QueryVariables>(
  opts: QueryCompositeOptions<TVars> | QueryCompositeOptions<TVars>['query']
) {
  const api = _useQuery<TData, TVars>(normalizeOptions(opts));
  await api.execute();

  return api;
}

useQuery.suspend = useQueryAsync;

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
