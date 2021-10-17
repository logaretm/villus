import { defineComponent, UnwrapRef, VNode } from 'vue';
import { useMutation } from './useMutation';
import type { BaseQueryApi } from './useQuery';
import { normalizeChildren } from './utils';

type QuerySlotProps = UnwrapRef<Pick<BaseQueryApi, 'data' | 'error' | 'execute' | 'isDone' | 'isFetching'>>;

const MutationImpl = defineComponent({
  name: 'Mutation',
  props: {
    query: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, ctx) {
    const { data, isFetching, isDone, error, execute } = useMutation(props.query as string);

    return () => {
      return normalizeChildren(ctx, {
        data: data.value,
        isFetching: isFetching.value,
        isDone: isDone.value,
        error: error.value,
        execute,
      });
    };
  },
});

export const Mutation = MutationImpl as typeof MutationImpl & {
  new (): {
    $slots: {
      default: (arg: QuerySlotProps) => VNode[];
    };
  };
};
