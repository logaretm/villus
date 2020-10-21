import { defineComponent, toRef, watch } from 'vue-demi';
import { normalizeChildren } from './utils';
import { useSubscription, defaultReducer, Reducer } from './useSubscription';

export const Subscription = defineComponent({
  name: 'Subscription',
  props: {
    query: {
      type: [String, Object],
      required: true,
    },
    variables: {
      type: Object,
      default: null,
    },
    paused: {
      type: Boolean,
      default: false,
    },
    reduce: {
      type: Function,
      default: undefined,
    },
  },
  setup(props, ctx) {
    const { data, error, pause, isPaused, resume } = useSubscription(
      {
        query: props.query as string,
        variables: props.variables as Record<string, any> | undefined,
      },
      (props.reduce as Reducer) || defaultReducer
    );

    watch(toRef(props, 'paused'), value => {
      if (value === isPaused.value) {
        return;
      }

      if (value) {
        pause();
        return;
      }

      resume();
    });

    return () => {
      return normalizeChildren(ctx, {
        data: data.value,
        error: error.value,
        pause,
        isPaused: isPaused.value,
        resume,
      });
    };
  },
});
