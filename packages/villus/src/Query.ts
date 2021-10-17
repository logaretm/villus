import { defineComponent, Ref, toRef, UnwrapRef, VNode, watch } from 'vue';
import { CachePolicy } from './types';
import { useQuery, BaseQueryApi } from './useQuery';
import { normalizeChildren } from './utils';

type QuerySlotProps = UnwrapRef<Pick<BaseQueryApi, 'data' | 'error' | 'execute' | 'isDone' | 'isFetching'>>;

const QueryImpl = defineComponent({
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
      default: true,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    fetchOnMount: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, ctx) {
    function createRenderFn(api: BaseQueryApi<any>) {
      const { data, error, isFetching, isDone, execute, watchVariables, isWatchingVariables, unwatchVariables } = api;

      watch(
        toRef(props, 'watchVariables'),
        value => {
          if (value === isWatchingVariables.value) {
            return;
          }

          if (value) {
            watchVariables();
            return;
          }

          unwatchVariables();
        },
        {
          immediate: true,
        }
      );

      return () => {
        const slotProps: QuerySlotProps = {
          data: data.value,
          error: error.value,
          isFetching: isFetching.value,
          isDone: isDone.value,
          execute,
        };

        return normalizeChildren(ctx, slotProps);
      };
    }

    const opts = {
      query: toRef(props, 'query') as Ref<string>,
      variables: toRef(props, 'variables') as Ref<Record<string, any> | undefined>,
      fetchOnMount: props.fetchOnMount,
      cachePolicy: props.cachePolicy as CachePolicy,
    };

    if (props.suspended) {
      return useQuery(opts).then(createRenderFn);
    }

    return createRenderFn(useQuery(opts));
  },
});

export const Query = QueryImpl as typeof QueryImpl & {
  new (): {
    $slots: {
      default: (arg: QuerySlotProps) => VNode[];
    };
  };
};
