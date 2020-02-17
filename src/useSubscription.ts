import { VqlClient } from './client';
import { Unsub, Operation, OperationResult } from './types';
import { inject, ref, Ref, onMounted } from '@vue/composition-api';
import { CombinedError } from './utils';

interface SubscriptionCompositeOptions {
  query: Operation['query'];
  variables?: Operation['variables'];
}

type Reducer = (prev: any, value: OperationResult) => any;

export function useSubscription(
  { query, variables }: SubscriptionCompositeOptions,
  reduce: Reducer = (_, val) => val.data
) {
  const client = inject('$villus') as VqlClient;
  if (!client) {
    throw new Error('Cannot detect villus Client, did you forget to call `useClient`?');
  }

  const data: Ref<Record<string, any> | null> = ref(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const paused = ref(false);

  function initObserver() {
    function handleState(result: OperationResult) {
      data.value = reduce(data.value, result);
      error.value = result.error;
    }

    paused.value = false;

    return client
      .executeSubscription({
        query,
        variables: variables || {}
      })
      .subscribe({
        next: handleState,
        // eslint-disable-next-line
        complete() {},
        error(err) {
          const result = { data: null, error: new CombinedError({ response: null, networkError: err }) };

          return handleState(result);
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
