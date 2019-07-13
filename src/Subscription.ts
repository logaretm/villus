import Vue, { VueConstructor } from 'vue';
import { VqlClient } from './client';
import { normalizeChildren } from './utils';
import { Unsub } from './types';

function componentData() {
  const data: any = null;
  const errors: any = null;

  return {
    data,
    errors,
    fetching: false
  };
}

type withVqlClient = VueConstructor<
  Vue & {
    _cachedVars?: number;
    $vql: VqlClient;
    $observer?: Unsub;
  }
>;

export const Subscription = (Vue as withVqlClient).extend({
  name: 'Subscription',
  inject: ['$vql'],
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
    if (!this.$vql) {
      throw new Error('Cannot detect Client Provider');
    }

    const self = this;
    this.$observer = this.$vql
      .subscribe({
        query: this.query,
        variables: this.variables
      })
      .subscribe({
        next(result) {
          self.data = result.data;
          self.errors = result.errors;
        },
        complete() {},
        error(err) {
          self.data = undefined;
          self.errors = [err];
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
      errors: this.errors,
      fetching: this.fetching
    });

    if (!children.length) {
      return h();
    }

    return children.length === 1 ? children[0] : h('span', children);
  }
});
