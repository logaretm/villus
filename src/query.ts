import { normalizeVariables, normalizeQuery } from './utils';
import { CachePolicy } from './types';

export const Query = {
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
    }
  },
  data: () => ({
    data: null,
    errors: null,
    fetching: false,
    done: false
  }),
  // serverPrefetch(this: any) {
  //   // fetch it on the server-side.
  //   return this.fetch();
  // },
  methods: {
    async fetch(this: any, vars: object = {}, cachePolicy: CachePolicy) {
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
          variables: normalizeVariables(this.variables, vars),
          cachePolicy
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
  mounted(this: any) {
    // fetch it on client side if it was not already.
    if (!this.data) {
      this.fetch();
    }
  },
  render(this: any, h: any) {
    const slot = this.$scopedSlots.default({
      data: this.data,
      errors: this.errors,
      fetching: this.fetching,
      done: this.done,
      execute: ({ cachePolicy }: { cachePolicy: CachePolicy }) => this.fetch({}, cachePolicy)
    });

    if (Array.isArray(slot)) {
      return h('div', null, slot);
    }

    return slot;
  }
};
