import { ref, Ref, shallowRef, unref } from 'vue';
import { MaybeRef, OperationResult, QueryExecutionContext, QueryVariables } from './types';
import { CombinedError, createAbortController, injectWithSelf } from './utils';
import { VILLUS_CLIENT } from './symbols';
import { Operation } from '../../shared/src';

interface MutationExecutionOptions {
  context: MaybeRef<QueryExecutionContext>;
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
  const abortController = shallowRef<AbortController | undefined>();
  function abort() {
    abortController.value?.abort();
  }
  // This is to prevent state mutation for racing requests, basically favoring the very last one
  let lastPendingOperation: Promise<OperationResult<TData>> | undefined;
  async function execute(variables?: TVars) {
    if (lastPendingOperation) {
      abort();
    }

    isFetching.value = true;
    abortController.value = createAbortController();
    const vars = variables || {};
    const pendingExecution = client.executeMutation<TData, TVars>(
      {
        query,
        variables: vars as TVars, // FIXME: fix this casting
      },
      {
        signal: abortController.value?.signal,
        ...unref(opts?.context || {}),
      }
    );

    lastPendingOperation = pendingExecution;
    const res = await pendingExecution;
    // Avoid state mutation if the pendingExecution isn't the last pending operation
    if (pendingExecution !== lastPendingOperation) {
      // we still return this result to preserve the integrity of "execute" calls
      return { data: res.data as TData, error: res.error };
    }

    lastPendingOperation = undefined;
    abortController.value = undefined;
    if (res.aborted) {
      isFetching.value = false;

      return res;
    }

    data.value = res.data;
    error.value = res.error;
    isDone.value = true;
    isFetching.value = false;

    return { data: data.value, error: error.value };
  }

  return { data, isFetching, isDone, error, execute, abort };
}
