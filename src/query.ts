import Vue, { VueConstructor } from 'vue';
import { normalizeVariables, normalizeQuery, normalizeChildren, hash } from './utils';
import { CachePolicy } from './types';
import { VqlClient } from './client';

type withVqlClient = VueConstructor<
  Vue & {
    _cachedVars?: number;
    $vql: VqlClient;
  }
>;

function componentData() {
  const data: any = null;
  const errors: any = null;

  return {
    data,
    errors,
    fetching: false,
    done: false
  };
}

export const Query = (Vue as withVqlClient).extend({
  name: 'Query',
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
    cachePolicy: {
      type: String,
      default: null,
      validator(value) {
        const isValid = ['cache-and-network', 'network-only', 'cache-first'].indexOf(value) > -1;

        return isValid;
      }
    },
    refetch: {
      type: Boolean,
      default: true
    }
  },
  data: componentData,
  serverPrefetch() {
    // fetch it on the server-side.
    return (this as any).fetch();
  },
  watch: {
    variables: {
      deep: true,
      handler(value) {
        if (this.refetch === false) {
          return;
        }

        const id = hash(JSON.stringify(value));
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
      if (!this.$vql) {
        throw new Error('Could not find the VQL client, did you install the plugin correctly?');
      }

      const query = normalizeQuery(this.query);
      if (!query) {
        throw new Error('A query must be provided.');
      }

      try {
        this.fetching = true;
        const { data, errors } = await this.$vql.query({
          query,
          variables: normalizeVariables(this.variables, vars || {}),
          cachePolicy: cachePolicy || (this.cachePolicy as CachePolicy)
        });

        this.data = data;
        this.errors = errors;
      } catch (err) {
        console.log(err);
        this.errors = [err.message];
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
      errors: this.errors,
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
