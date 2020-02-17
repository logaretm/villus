import Vue, { VueConstructor } from 'vue';
import stringify from 'fast-json-stable-stringify';
import { CachePolicy } from './types';
import { VqlClient } from './client';
import { normalizeChildren, hash, CombinedError } from './utils';

type withVqlClient = VueConstructor<
  Vue & {
    _cachedVars?: number;
    $villus: VqlClient;
  }
>;

function componentData() {
  const data: any = null;
  const error: CombinedError | null = null;

  return {
    data,
    error,
    fetching: false,
    done: false
  };
}

export const Query = (Vue as withVqlClient).extend({
  name: 'Query',
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
    cachePolicy: {
      type: String,
      default: undefined,
      validator(value) {
        const isValid = [undefined, 'cache-and-network', 'network-only', 'cache-first'].indexOf(value) !== -1;

        return isValid;
      }
    },
    pause: {
      type: Boolean,
      default: false
    }
  },
  data: componentData,
  watch: {
    variables: {
      deep: true,
      handler(value) {
        if (this.pause) {
          return;
        }

        const id = hash(stringify(value));
        if (id === this._cachedVars) {
          return;
        }

        this._cachedVars = id;
        // tslint:disable-next-line: no-floating-promises
        this.fetch();
      }
    }
  },
  methods: {
    async fetch(vars?: object, cachePolicy?: CachePolicy) {
      if (!this.$villus) {
        throw new Error('Could not detect Client Provider');
      }

      try {
        this.fetching = true;
        const { data, error } = await this.$villus.executeQuery({
          query: this.query,
          variables: { ...this.variables, ...vars },
          cachePolicy: cachePolicy || (this.cachePolicy as CachePolicy)
        });

        this.data = data;
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.error = error as CombinedError;
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.error = new CombinedError({ networkError: err, response: null });
        this.data = null;
      } finally {
        this.done = true;
        this.fetching = false;
      }
    }
  },
  mounted() {
    // fetch it on client side if it was not already.
    if (!this.data) {
      // tslint:disable-next-line: no-floating-promises
      this.fetch();
    }
  },
  render(h) {
    const children = normalizeChildren(this, {
      data: this.data,
      error: this.error,
      fetching: this.fetching,
      done: this.done,
      execute: ({ cachePolicy }: { cachePolicy?: CachePolicy } = {}) => this.fetch({}, cachePolicy)
    });

    if (!children.length) {
      return h();
    }

    return children.length === 1 ? children[0] : h('span', children);
  }
});
