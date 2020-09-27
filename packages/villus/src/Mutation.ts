import { SetupContext } from 'vue-demi';
import { useMutation } from './useMutation';
import { normalizeChildren } from './utils';
import { DocumentNode } from 'graphql';

interface MutationProps {
  query: string | DocumentNode;
}

export const Mutation = {
  name: 'Mutation',
  props: {
    query: {
      type: [String, Object],
      required: true,
    },
  },
  setup(props: MutationProps, ctx: SetupContext) {
    const { data, isFetching, isDone, error, execute } = useMutation({
      ...props,
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
};
