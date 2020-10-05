import { SetupContext, toRefs, watchEffect } from 'vue-demi';
import { QueryComposable, useQuery } from './useQuery';
import { CachePolicy } from './types';
import { normalizeChildren } from './utils';
import { DocumentNode } from 'graphql';

interface QueryProps {
  query: string | DocumentNode;
  variables?: Record<string, any>;
  cachePolicy?: CachePolicy;
  lazy?: boolean;
  pause?: boolean;
  suspend?: boolean;
}

export const Query = {
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
      validator(value: string) {
        const isValid = [undefined, 'cache-and-network', 'network-only', 'cache-first'].indexOf(value) !== -1;

        return isValid;
      },
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
  setup(props: QueryProps, ctx: SetupContext) {
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
};
