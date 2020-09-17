import { ref, Ref, inject } from 'vue-demi';
import { Operation, QueryVariables } from './types';
import { VqlClient } from './client';
import { CombinedError } from './utils';

interface MutationCompositeOptions {
  query: Operation['query'];
}

export function useMutation<TData = any, TVars = QueryVariables>(opts: MutationCompositeOptions | Operation['query']) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<TData | null> = ref(null);
  const fetching = ref(false);
  const done = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(variables?: TVars) {
    fetching.value = true;
    const vars = variables || {};
    const res = await client.executeMutation<TData, TVars>({
      query: typeof opts !== 'string' && 'query' in opts ? opts.query : opts,
      variables: vars as TVars, // FIXME: fix this casting
    });

    data.value = res.data;
    error.value = res.error;
    done.value = true;
    fetching.value = false;
  }

  return { data, fetching, done, error, execute };
}
