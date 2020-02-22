import stringify from 'fast-json-stable-stringify';
import { ref, Ref, inject, isRef, onMounted, watch, readonly } from 'vue';
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
  const error = ref<CombinedError | null>(null);

  async function execute(overrideOpts: { cachePolicy?: CachePolicy } = {}) {
    fetching.value = true;
    const vars = (isRef(variables) ? variables.value : variables) || {};
    const res = await client.executeQuery<TData, TVars>({
      query: isRef(query) ? query.value : query,
      variables: vars as TVars, // FIXME: Try to avoid casting
      cachePolicy: overrideOpts?.cachePolicy || cachePolicy
    });

    data.value = res.data;
    error.value = res.error;
    done.value = true;
    fetching.value = false;
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

  return { data, fetching, done, error, execute, pause, paused: readonly(paused), resume };
}

function useQuery<TData = any, TVars = QueryVariables>(opts: QueryCompositeOptions<TVars>) {
  const api = _useQuery<TData, TVars>(opts);
  // Fetch on mounted if lazy is disabled.
  if (!opts.lazy) {
    onMounted(() => {
      api.execute();
    });
  }

  return api;
}

async function useQueryAsync<TData = any, TVars = QueryVariables>(opts: QueryCompositeOptions<TVars>) {
  const api = _useQuery<TData, TVars>(opts);
  await api.execute();

  return api;
}

useQuery.suspend = useQueryAsync;

export { useQuery };
