import { ref, Ref, inject } from '@vue/composition-api';
import { Operation } from './types';
import { VqlClient } from './client';
import { CombinedError } from './utils';

interface MutationCompositeOptions {
  query: Operation['query'];
}

export function useMutation({ query }: MutationCompositeOptions) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<Record<string, any> | null> = ref(null);
  const fetching = ref(false);
  const done = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(variables: Operation['variables'] = {}) {
    try {
      fetching.value = true;
      const vars = variables || {};
      const res = await client.executeMutation({
        query,
        variables: vars
      });

      data.value = res.data;
      error.value = res.error;
    } catch (err) {
      error.value = new CombinedError({ response: null, networkError: err });
      data.value = null;
    } finally {
      done.value = true;
      fetching.value = false;
    }
  }

  return { data, fetching, done, error, execute };
}
