import { inject, ref, Ref, onMounted } from 'vue';
import { VqlClient } from './client';
import { Unsub, Operation, OperationResult, QueryVariables } from './types';
import { CombinedError } from './utils';

interface SubscriptionCompositeOptions<TVars> {
  query: Operation['query'];
  variables?: TVars;
}

export type Reducer<TData = any, TResult = TData> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  { query, variables }: SubscriptionCompositeOptions<TVars>,
  reduce: Reducer<TData, TResult> = defaultReducer
) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data = ref<TResult | null>(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const paused = ref(false);

  function initObserver() {
    function handler(result: OperationResult<TData>) {
      // FIXME: very confused here.
      data.value = reduce(data.value as TResult, result) as any;
      error.value = result.error;
    }

    paused.value = false;

    return client
      .executeSubscription({
        query,
        variables: variables || {}
      })
      .subscribe({
        next: handler,
        // eslint-disable-next-line
        complete() {},
        error(err) {
          const result = { data: null, error: new CombinedError({ networkError: err, response: null }) };

          return handler(result);
        }
      });
  }

  let observer: Unsub;
  onMounted(() => {
    observer = initObserver();
  });

  function pause() {
    if (!observer) return;

    observer.unsubscribe();
    paused.value = true;
  }

  function resume() {
    observer = initObserver();
  }

  return { data, error, paused, pause, resume };
}
