import { defineComponent, SetupContext } from 'vue-demi';
import { useMutation } from './useMutation';
import { normalizeChildren } from './utils';

export const Mutation = defineComponent({
  name: 'Mutation',
  props: {
    query: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props, ctx: SetupContext) {
    const { data, isFetching, isDone, error, execute } = useMutation({
      query: props.query as string,
    });

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
