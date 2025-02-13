import {
  ref,
  Ref,
  onMounted,
  onBeforeUnmount,
  watch,
  getCurrentInstance,
  computed,
  MaybeRefOrGetter,
  toValue,
} from 'vue';
import { Unsubscribable, OperationResult, StandardOperationResult, QueryPredicateOrSignal } from './types';
import { CombinedError, isWatchable, debounceAsync, isEqual, unravel } from './utils';
import { Operation, QueryVariables } from '../../shared/src';
import { Client, resolveClient } from './client';

interface SubscriptionCompositeOptions<TData, TVars, TResult = TData> {
  query: MaybeRefOrGetter<Operation<TData, TVars>['query']>;
  variables?: MaybeRefOrGetter<TVars>;
  skip?: QueryPredicateOrSignal<TVars>;
  paused?: QueryPredicateOrSignal<TVars>;
  client?: Client;
  initialData?: TResult;
  subscribeOnMount?: boolean;
  unsubscribeOnUnmount?: boolean;
}

export type Reducer<TData = any, TResult = TData> = (value: OperationResult<TData>, prev: TResult | null) => TResult;

export const defaultReducer: Reducer = val => val.data;

export interface SubscriptionReturns<TData = any, TResult = TData> {
  data: Ref<TResult | null>;
  error: Ref<CombinedError | null>;
  paused: Ref<boolean>;
  isFetching: Ref<boolean>;
  subscribe: () => void;
  unsubscribe: () => void;
  isSubscribed: () => boolean;
}

export function useSubscription<TData = any, TResult = TData, TVars = QueryVariables>(
  opts: SubscriptionCompositeOptions<TData, TVars, TResult>,
  reduce: Reducer<TData, TResult> = defaultReducer,
): SubscriptionReturns<TData, TResult> {
  const client = opts.client ?? resolveClient();
  const { query, variables, paused, skip } = opts;
  const subscribeOnMount = opts.subscribeOnMount ?? true;
  const unsubscribeOnUnmount = opts.unsubscribeOnUnmount ?? true;
  const data: Ref<TResult | null> = ref(
    opts?.initialData ?? reduce({ data: null, error: null }, null),
  ) as Ref<TResult | null>;
  const error: Ref<CombinedError | null> = ref(null);
  const isPaused = computed(() => unravel(paused, variables as TVars) ?? false);
  const isFetching = ref(true);

  function handleResponse(result: OperationResult<TData>) {
    data.value = reduce(result, data.value as TResult) as any;
    error.value = result.error;
  }

  /**
   * if can not getCurrentInstance, the func use outside of setup, cannot get onMounted
   * when outside of setup initObserver immediately.
   */
  let observer: Unsubscribable | undefined;

  const subscribe = debounceAsync(async function subscribe() {
    unsubscribe();
    if (shouldSkip()) {
      return;
    }

    isFetching.value = true;
    const result = await client.executeSubscription<TData, TVars>({
      query: toValue(query),
      variables: toValue(variables),
    });

    observer = result.subscribe({
      next(result) {
        if (isPaused.value) {
          return;
        }

        const response = transformResult(result);
        isFetching.value = false;

        handleResponse(response);
      },

      complete() {},
      error(err) {
        if (isPaused.value) {
          return;
        }

        const response = { data: null, error: new CombinedError({ networkError: err, response: null }) };
        isFetching.value = false;

        return handleResponse(response);
      },
    });

    return observer;
  });

  function unsubscribe() {
    observer?.unsubscribe();
    observer = undefined;
  }

  const vm = getCurrentInstance();
  if (!isPaused.value && !shouldSkip() && subscribeOnMount) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    vm ? onMounted(subscribe) : subscribe();
  }

  if (vm && unsubscribeOnUnmount) {
    // TODO: if outside of setup, it should be recommend manually pause it(or some action else)
    onBeforeUnmount(unsubscribe);
  }

  function shouldSkip() {
    return unravel(skip, toValue(variables) || ({} as TVars));
  }

  if (isWatchable(paused)) {
    watch(paused, val => {
      if (!val) {
        subscribe();
      }
    });
  }

  if (isWatchable(query)) {
    watch(query, subscribe);
  }

  if (isWatchable(variables)) {
    watch(variables, (value, oldValue) => {
      if (!isEqual(value, oldValue)) {
        subscribe();
      }
    });
  }

  if (isWatchable(skip)) {
    watch(shouldSkip, (value, oldValue) => {
      if (value === oldValue) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      value ? unsubscribe() : subscribe();
    });
  }

  function isSubscribed() {
    return !!observer;
  }

  return {
    data,
    error,
    paused: isPaused,
    isFetching,
    subscribe: () => {
      subscribe();
    },
    unsubscribe,
    isSubscribed,
  };
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
