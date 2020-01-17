import { SetupContext } from 'vue';
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
      required: true
    }
  },
  setup(props: MutationProps, ctx: SetupContext) {
    const { data, fetching, done, error, execute } = useMutation({
      ...props
    });

    return () => {
      return normalizeChildren(ctx, {
        data: data.value,
        fetching: fetching.value,
        done: done.value,
        error: error.value,
        execute
      });
    };
  }
};
