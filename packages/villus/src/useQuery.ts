import { isReactive, isRef, onMounted, Ref, ref, watch } from 'vue-demi';
import { CachePolicy, MaybeReactive, Operation, QueryVariables } from './types';
import { hash, CombinedError, toWatchableSource, stringify, injectWithSelf } from './utils';
import { VILLUS_CLIENT } from './symbols';

interface QueryCompositeOptions<TData, TVars> {
  query: MaybeReactive<Operation<TData, TVars>['query']>;
  variables?: MaybeReactive<TVars>;
  cachePolicy?: CachePolicy;
  fetchOnMount?: boolean;
}

interface QueryExecutionOpts {
  cachePolicy?: CachePolicy;
}

function useQuery<TData = any, TVars = QueryVariables>(opts: QueryCompositeOptions<TData, TVars>) {
  const client = injectWithSelf(VILLUS_CLIENT, () => {
    return new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  });

  let { query, variables, cachePolicy, fetchOnMount } = normalizeOptions(opts);
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

  let stopVarsWatcher: ReturnType<typeof watch>;
  const isWatchingVariables: Ref<boolean> = ref(true);

  function beginWatchingVars() {
    let oldCache: number;
    if ((!isRef(variables) && !isReactive(variables)) || !variables) {
      return;
    }

    const watchableVars = toWatchableSource(variables);
    isWatchingVariables.value = true;
    stopVarsWatcher = watch(
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

  function unwatchVariables() {
    if (!isWatchingVariables.value) return;

    stopVarsWatcher();
    isWatchingVariables.value = false;
  }

  function watchVariables() {
    if (isWatchingVariables.value) return;

    beginWatchingVars();
  }

  beginWatchingVars();

  const api = { data, isFetching, isDone, error, execute, unwatchVariables, watchVariables, isWatchingVariables };

  onMounted(() => {
    if (fetchOnMount) {
      execute();
    }
  });

  return {
    ...api,
    async then(onFulfilled: (value: any) => any) {
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
