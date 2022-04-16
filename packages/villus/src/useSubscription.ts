import { ref, Ref, onMounted, unref, onBeforeUnmount, watch, isRef, getCurrentInstance } from 'vue';
import { VILLUS_CLIENT } from './symbols';
import { Unsubscribable, OperationResult, QueryVariables, MaybeRef, StandardOperationResult } from './types';
import { CombinedError, resolveClient } from './utils';
import { Operation } from '../../shared/src';
import { Client } from './client';

interface SubscriptionCompositeOptions<TData, TVars> {
  query: MaybeRef<Operation<TData, TVars>['query']>;
  variables?: MaybeRef<TVars>;
  paused?: boolean;
}

export type Reducer<TData = any, TResult = TData> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  { query, variables, paused }: SubscriptionCompositeOptions<TData, TVars>,
  reduce: Reducer<TData, TResult> = defaultReducer,
  manualClient?: Client
) {
  const client = manualClient ?? resolveClient(VILLUS_CLIENT);

  const data = ref<TResult | null>(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const isPaused = ref(paused || false);

  function handleResponse(result: OperationResult<TData>) {
    data.value = reduce(data.value as TResult, result) as any;
    error.value = result.error;
  }

  async function initObserver() {
    isPaused.value = false;

    const result = await client.executeSubscription<TData, TVars>({
      query: unref(query),
      variables: unref(variables) as TVars,
    });

    return result.subscribe({
      next(result) {
        if (isPaused.value) {
          return;
        }

        const response = transformResult(result);

        handleResponse(response);
      },
      // eslint-disable-next-line
      complete() {},
      error(err) {
        if (isPaused.value) {
          return;
        }

        const response = { data: null, error: new CombinedError({ networkError: err, response: null }) };

        return handleResponse(response);
      },
    });
  }

  /**
   * if can not getCurrentInstance, the func use outside of setup, cannot get onMounted
   * when outside of setup initObserver immediately.
   */
  let observer: Unsubscribable;
  const vm = getCurrentInstance();
  if (!paused) {
    const getObserver = async () => {
      observer = await initObserver();
    };
    vm ? onMounted(() => getObserver()) : getObserver();
  }

  // todo: if outside of setup, it should be recommend manually pause it(or someaction else)
  vm && onBeforeUnmount(() => observer && observer.unsubscribe());

  function pause() {
    isPaused.value = true;
  }

  async function resume() {
    if (!observer) {
      reInit();
    }

    isPaused.value = false;
  }

  async function reInit() {
    if (observer) {
      observer.unsubscribe();
    }

    observer = await initObserver();
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
