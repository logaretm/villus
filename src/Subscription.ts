import { SetupContext } from 'vue';
import { normalizeChildren } from './utils';
import { useSubscription } from './useSubscription';
import { DocumentNode } from 'graphql';

interface SubscriptionProps {
  query: string | DocumentNode;
  variables?: Record<string, any>;
}

export const Subscription = {
  name: 'Subscription',
  props: {
    query: {
      type: [String, Object],
      required: true
    },
    variables: {
      type: Object,
      default: null
    },
    pause: {
      type: Boolean,
      default: false
    }
  },
  setup(props: SubscriptionProps, ctx: SetupContext) {
    const { data, errors, pause, paused, resume } = useSubscription({
      ...props
    });

    return () => {
      return normalizeChildren(ctx, {
        data: data.value,
        errors: errors.value,
        pause,
        paused: paused.value,
        resume
      });
    };
  }
};
