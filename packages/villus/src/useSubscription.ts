import { inject, ref, Ref, onMounted } from 'vue-demi';
import { Client } from './client';
import { VILLUS_CLIENT } from './symbols';
import { Unsub, Operation, OperationResult, QueryVariables } from './types';
import { CombinedError, injectWithSelf } from './utils';

interface SubscriptionCompositeOptions<TData, TVars> {
  query: Operation<TData, TVars>['query'];
  variables?: TVars;
}

export type Reducer<TData = any, TResult = TData> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  opts: SubscriptionCompositeOptions<TData, TVars> | Operation<TData, TVars>['query'],
  reduce: Reducer<TData, TResult> = defaultReducer
) {
  const client = injectWithSelf(VILLUS_CLIENT, () => {
    return new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  });

  const { query, variables } =
    typeof opts !== 'string' && 'query' in opts ? opts : { query: opts, variables: {} as TVars };
  const data = ref<TResult | null>(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const isPaused = ref(false);

  async function initObserver() {
    function handler(result: OperationResult<TData>) {
      data.value = reduce(data.value as TResult, result) as any;
      error.value = result.error;
    }

    isPaused.value = false;

    const result = await client.executeSubscription<TData, TVars>({
      query,
      variables,
    });

    return result.subscribe({
      next: handler,
      // eslint-disable-next-line
      complete() {},
      error(err) {
        const result = { data: null, error: new CombinedError({ networkError: err, response: null }) };

        return handler(result);
      },
    });
  }

  let observer: Unsub;
  onMounted(async () => {
    observer = await initObserver();
  });

  function pause() {
    if (!observer) return;

    observer.unsubscribe();
    isPaused.value = true;
  }

  async function resume() {
    observer = await initObserver();
  }

  return { data, error, isPaused, pause, resume };
}
