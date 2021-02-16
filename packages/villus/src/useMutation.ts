import { ref, Ref, unref } from 'vue-demi';
import { MaybeReactive, QueryExecutionContext, QueryVariables } from './types';
import { CombinedError, injectWithSelf } from './utils';
import { VILLUS_CLIENT } from './symbols';
import { Operation } from '../../shared/src';

interface MutationExecutionOptions {
  context: MaybeReactive<QueryExecutionContext>;
}

export function useMutation<TData = any, TVars = QueryVariables>(
  query: Operation<TData, TVars>['query'],
  opts?: Partial<MutationExecutionOptions>
) {
  const client = injectWithSelf(VILLUS_CLIENT, () => {
    return new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  });

  const data: Ref<TData | null> = ref(null);
  const isFetching = ref(false);
  const isDone = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  async function execute(variables?: TVars) {
    isFetching.value = true;
    const vars = variables || {};
    const res = await client.executeMutation<TData, TVars>(
      {
        query,
        variables: vars as TVars, // FIXME: fix this casting
      },
      unref(opts?.context)
    );

    data.value = res.data;
    error.value = res.error;
    isDone.value = true;
    isFetching.value = false;

    return { data: data.value, error: error.value };
  }

  return { data, isFetching, isDone, error, execute };
}
