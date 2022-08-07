import { ref, Ref, onMounted, unref, onBeforeUnmount, watch, isRef, getCurrentInstance, computed } from 'vue';
import {
  Unsubscribable,
  OperationResult,
  QueryVariables,
  MaybeRef,
  StandardOperationResult,
  QueryPredicateOrSignal,
} from './types';
import { CombinedError, isWatchable, unravel } from './utils';
import { Operation } from '../../shared/src';
import { Client, resolveClient } from './client';

interface SubscriptionCompositeOptions<TData, TVars> {
  query: MaybeRef<Operation<TData, TVars>['query']>;
  variables?: MaybeRef<TVars>;
  paused?: QueryPredicateOrSignal<TVars>;
  client?: Client;
}

export type Reducer<TData = any, TResult = TData> = (prev: TResult | null, value: OperationResult<TData>) => TResult;

export const defaultReducer: Reducer = (_, val) => val.data;

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  opts: SubscriptionCompositeOptions<TData, TVars>,
  reduce: Reducer<TData, TResult> = defaultReducer
) {
  const client = opts.client ?? resolveClient();
  const { query, variables, paused } = opts;
  const data = ref<TResult | null>(reduce(null, { data: null, error: null }));
  const error: Ref<CombinedError | null> = ref(null);
  const isPaused = computed(() => unravel(paused, variables as TVars));

  function handleResponse(result: OperationResult<TData>) {
    data.value = reduce(data.value as TResult, result) as any;
    error.value = result.error;
  }

  /**
   * if can not getCurrentInstance, the func use outside of setup, cannot get onMounted
   * when outside of setup initObserver immediately.
   */
  let observer: Unsubscribable;

  async function initObserver() {
    observer?.unsubscribe();
    const result = await client.executeSubscription<TData, TVars>({
      query: unref(query),
      variables: unref(variables) as TVars,
    });

    observer = result.subscribe({
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

    return observer;
  }

  const vm = getCurrentInstance();
  if (!isPaused.value) {
    vm ? onMounted(initObserver) : initObserver();
  }

  // TODO: if outside of setup, it should be recommend manually pause it(or some action else)
  vm && onBeforeUnmount(() => observer?.unsubscribe());

  if (isWatchable(paused)) {
    watch(paused, val => {
      if (!val) {
        initObserver();
      }
    });
  }

  if (isRef(query)) {
    watch(query, initObserver);
  }

  if (isRef(variables)) {
    watch(variables, initObserver);
  }

  return { data, error, paused: isPaused };
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
