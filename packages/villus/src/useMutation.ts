import { ref, Ref, unref, nextTick } from 'vue';
import { MaybeRef, OperationResult, QueryExecutionContext } from './types';
import { CombinedError } from './utils';
import { Operation, QueryVariables } from '../../shared/src';
import { Client, resolveClient } from './client';

export interface MutationExecutionOptions<TData> {
  context: MaybeRef<QueryExecutionContext>;
  client?: Client;
  clearCacheTags?: string[];
  refetchTags?: string[];
  onData?: (data: TData) => void;
  onError?: (err: CombinedError) => void;
}

export interface MutationResult<TData> {
  data: TData | null;
  error: CombinedError | null;
}

export interface MutationApi<TData, TVars> {
  data: Ref<TData | null>;
  isFetching: Ref<boolean>;
  isDone: Ref<boolean>;
  error: Ref<CombinedError | null>;
  execute(vars?: TVars): Promise<MutationResult<TData>>;
}

export function useMutation<TData = any, TVars = QueryVariables>(
  query: Operation<TData, TVars>['query'],
  opts?: Partial<MutationExecutionOptions<TData>>,
): MutationApi<TData, TVars> {
  const client = opts?.client ?? resolveClient();
  const data: Ref<TData | null> = ref(null);
  const isFetching = ref(false);
  const isDone = ref(false);
  const error: Ref<CombinedError | null> = ref(null);

  // This is to prevent state mutation for racing requests, basically favoring the very last one
  let lastPendingOperation: Promise<OperationResult<TData>> | undefined;
  async function execute(variables?: TVars): Promise<MutationResult<TData>> {
    isFetching.value = true;
    const vars = variables || {};
    const pendingExecution = client.executeMutation<TData, TVars>(
      {
        query,
        variables: vars as TVars, // FIXME: fix this casting
        clearCacheTags: [...(opts?.clearCacheTags || []), ...(opts?.refetchTags || [])],
      },
      unref(opts?.context),
    );

    lastPendingOperation = pendingExecution;
    const res = await pendingExecution;
    nextTick(() => {
      if (opts?.refetchTags) {
        client.refetchTaggedQueries(opts.refetchTags);
      }
    });

    // Avoid state mutation if the pendingExecution isn't the last pending operation
    if (pendingExecution !== lastPendingOperation) {
      // we still return this result to preserve the integrity of "execute" calls
      return { data: res.data as TData, error: res.error };
    }

    if (res.data) opts?.onData?.(res.data);
    if (res.error) opts?.onError?.(res.error);
    data.value = res.data;
    error.value = res.error;
    isDone.value = true;
    isFetching.value = false;
    lastPendingOperation = undefined;

    return { data: data.value, error: error.value };
  }

  return { data, isFetching, isDone, error, execute };
}
