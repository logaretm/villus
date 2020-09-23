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
    pause: {
      type: Boolean,
      default: false,
    },
    suspend: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: QueryProps, ctx: SetupContext) {
    function createRenderFn(api: QueryComposable<unknown>) {
      const { data, error, isFetching, isDone, execute, pause, resume } = api;

      watchEffect(() => {
        if (props.pause === true) {
          pause();
          return;
        }

        resume();
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
      ...toRefs(props),
      lazy: props.lazy,
      cachePolicy: props.cachePolicy,
    };

    if (props.suspend) {
      return useQuery(queryProps).then(createRenderFn);
    }

    return createRenderFn(useQuery(queryProps));
  },
};
