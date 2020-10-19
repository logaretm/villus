import { ref, Ref, inject } from 'vue-demi';
import { Operation, QueryVariables } from './types';
import { Client } from './client';
import { CombinedError } from './utils';

interface MutationCompositeOptions<TData, TVars> {
  query: Operation<TData, TVars>['query'];
}

export function useMutation<TData = any, TVars = QueryVariables>(
  opts: MutationCompositeOptions<TData, TVars> | Operation<TData, TVars>['query']
) {
  const client = inject('$villus') as Client;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<TData | null> = ref(null);
  const isFetching = ref(false);
  const isDone = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(variables?: TVars) {
    isFetching.value = true;
    const vars = variables || {};
    const res = await client.executeMutation<TData, TVars>({
      query: typeof opts !== 'string' && 'query' in opts ? opts.query : opts,
      variables: vars as TVars, // FIXME: fix this casting
    });

    data.value = res.data;
    error.value = res.error;
    isDone.value = true;
    isFetching.value = false;

    return { data: data.value, error: error.value };
  }

  return { data, isFetching, isDone, error, execute };
}
