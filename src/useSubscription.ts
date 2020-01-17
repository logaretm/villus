import { inject, ref, Ref, onMounted } from 'vue';
import { VqlClient } from './client';
import { Unsub, Operation, OperationResult, QueryVariables } from './types';

interface SubscriptionCompositeOptions<TVars> {
  query: Operation['query'];
  variables?: TVars;
}

export type Reducer<TData = any, TResult = any> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = any, TVars = QueryVariables>(
  { query, variables }: SubscriptionCompositeOptions<TVars>,
  reduce: Reducer<TData, TResult> = defaultReducer
) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<TResult | null> = ref(reduce(null, { data: null, errors: null }));
  const errors: Ref<Error[] | null> = ref(null);
  const paused = ref(false);

  function initObserver() {
    function handler(result: OperationResult<TData>) {
      // FIXME: very confused here.
      data.value = reduce(data.value as TResult, result) as any;
      errors.value = result.errors;
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
          const result = { data: null, errors: [err] };

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

  return { data, errors, paused, pause, resume };
}
