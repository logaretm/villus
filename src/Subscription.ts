import Vue, { VueConstructor } from 'vue';
import { VqlClient } from './client';
import { normalizeChildren, CombinedError } from './utils';
import { Unsub } from './types';

function componentData() {
  const data: any = null;
  const error: CombinedError | null = null;

  return {
    data,
    error,
    fetching: false
  };
}

type withVqlClient = VueConstructor<
  Vue & {
    _cachedVars?: number;
    $villus: VqlClient;
    $observer?: Unsub;
  }
>;

export const Subscription = (Vue as withVqlClient).extend({
  name: 'Subscription',
  inject: ['$villus'],
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
  data: componentData,
  mounted() {
    if (!this.$villus) {
      throw new Error('Cannot detect villus Client Provider');
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.$observer = this.$villus
      .executeSubscription({
        query: this.query,
        variables: this.variables
      })
      .subscribe({
        next(result) {
          self.data = result.data;
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          self.error = result.error;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        complete() {},
        error(err) {
          self.data = undefined;
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          self.error = new CombinedError({ networkError: err, response: null });
        }
      });
  },
  beforeDestroy() {
    if (this.$observer) {
      this.$observer.unsubscribe();
    }
  },
  render(h) {
    const children = normalizeChildren(this, {
      data: this.data,
      error: this.error,
      fetching: this.fetching
    });

    if (!children.length) {
      return h();
    }

    return children.length === 1 ? children[0] : h('span', children);
  }
});
