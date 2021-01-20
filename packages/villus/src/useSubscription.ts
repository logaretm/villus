import { ref, Ref, onMounted, unref, onBeforeUnmount, watch, isRef } from 'vue-demi';
import { VILLUS_CLIENT } from './symbols';
import { Unsub, OperationResult, QueryVariables, MaybeReactive, StandardOperationResult } from './types';
import { CombinedError, injectWithSelf } from './utils';
import { Operation } from '../../shared/src';

interface SubscriptionCompositeOptions<TData, TVars> {
  query: MaybeReactive<Operation<TData, TVars>['query']>;
  variables?: MaybeReactive<TVars>;
}

export type Reducer<TData = any, TResult = TData> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  { query, variables }: SubscriptionCompositeOptions<TData, TVars>,
  reduce: Reducer<TData, TResult> = defaultReducer
) {
  const client = injectWithSelf(VILLUS_CLIENT, () => {
    return new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  });

  const data = ref<TResult | null>(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const isPaused = ref(false);

  async function initObserver() {
    function handleResponse(result: OperationResult<TData>) {
      data.value = reduce(data.value as TResult, result) as any;
      error.value = result.error;
    }

    isPaused.value = false;

    const result = await client.executeSubscription<TData, TVars>({
      query: unref(query),
      variables: unref(variables) as TVars,
    });

    return result.subscribe({
      next(result) {
        const response = transformResult(result);

        handleResponse(response);
      },
      // eslint-disable-next-line
      complete() {},
      error(err) {
        const response = { data: null, error: new CombinedError({ networkError: err, response: null }) };

        return handleResponse(response);
      },
    });
  }

  let observer: Unsub;
  onMounted(async () => {
    observer = await initObserver();
  });

  onBeforeUnmount(() => {
    observer.unsubscribe();
  });

  function pause() {
    if (!observer) return;

    observer.unsubscribe();
    isPaused.value = true;
  }

  async function resume() {
    observer = await initObserver();
  }

  function reInit() {
    pause();
    resume();
  }

  if (isRef(query)) {
    watch(query, reInit);
  }

  if (isRef(variables)) {
    watch(variables, reInit);
  }

  return { data, error, isPaused, pause, resume };
}

/**
 * Transforms the result from a standard operation result to villus result
 */
function transformResult<TData>(result: StandardOperationResult<TData>): OperationResult<TData> {
  if (!result.errors) {
    return { data: result.data || null, error: null };
  }

  return {
    data: result.data || null,
    error: new CombinedError({ graphqlErrors: [...result.errors], response: null }),
  };
}
