import { ref, Ref, inject } from 'vue';
import { Operation, QueryVariables } from './types';
import { VqlClient } from './client';

interface MutationCompositeOptions {
  query: Operation['query'];
}

export function useMutation<TData = any, TVars = QueryVariables>({ query }: MutationCompositeOptions) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<TData | null> = ref(null);
  const fetching = ref(false);
  const done = ref(false);
  const errors: Ref<any[] | null> = ref(null);

  async function execute(variables: TVars) {
    try {
      fetching.value = true;
      const vars = variables || {};
      const res = await client.executeMutation<TData, TVars>({
        query,
        variables: vars as TVars // FIXME: fix this casting
      });

      data.value = res.data;
      errors.value = res.errors;
    } catch (err) {
      errors.value = [err];
      data.value = null;
    } finally {
      done.value = true;
      fetching.value = false;
    }
  }

  return { data, fetching, done, errors, execute };
}
