import { defineComponent, Ref, toRef, watchEffect } from 'vue-demi';
import { CachePolicy } from './types';
import { QueryComposable, useQuery } from './useQuery';
import { normalizeChildren } from './utils';

export const Query = defineComponent({
  name: 'Query',
  props: {
    query: {
      type: [String, Object],
      required: true,
    },
    variables: {
      type: Object,
      default: null,
    },
    cachePolicy: {
      type: String,
      default: undefined,
    },
    watchVariables: {
      type: Boolean,
      default: false,
    },
    suspend: {
      type: Boolean,
      default: false,
    },
    fetchOnMount: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, ctx) {
    function createRenderFn(api: QueryComposable<unknown>) {
      const { data, error, isFetching, isDone, execute, watchVariables, unwatchVariables } = api;

      watchEffect(() => {
        if (props.watchVariables === true) {
          unwatchVariables();
          return;
        }

        watchVariables();
      });

      return () => {
        return normalizeChildren(ctx, {
          data: data.value,
          error: error.value,
          isFetching: isFetching.value,
          isDone: isDone.value,
          execute,
        });
      };
    }

    const queryProps = {
      query: toRef(props, 'query') as Ref<string>,
      variables: toRef(props, 'variables') as Ref<Record<string, any> | undefined>,
      fetchOnMounted: props.fetchOnMount,
      cachePolicy: props.cachePolicy as CachePolicy,
    };

    if (props.suspend) {
      return useQuery(queryProps).then(createRenderFn);
    }

    return createRenderFn(useQuery(queryProps));
  },
});
