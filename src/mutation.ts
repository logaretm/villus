import { normalizeQuery } from './utils';

export const Mutation = {
  name: 'Mutation',
  inject: ['$vql'],
  props: {
    query: {
      type: [String, Object],
      required: true
    }
  },
  data: () => ({
    data: null,
    errors: null,
    fetching: false,
    done: false
  }),
  methods: {
    async mutate(this: any, vars: object = {}) {
      if (!this.$vql) {
        throw new Error('Could not find the VQL client, did you install the plugin correctly?');
      }

      const query = normalizeQuery(this.query);
      if (!query) {
        throw new Error('A query must be provided.');
      }

      try {
        this.data = null;
        this.errors = null;
        this.fetching = true;
        this.done = false;
        const { data, errors } = await this.$vql.query({
          query,
          variables: vars || undefined
        });

        this.data = data;
        this.errors = errors;
        this.done = true;
      } catch (err) {
        this.errors = [err.message];
        this.data = null;
        this.done = false;
      } finally {
        this.fetching = false;
      }
    }
  },
  render(this: any, h: any) {
    const slot = this.$scopedSlots.default({
      data: this.data,
      errors: this.errors,
      fetching: this.fetching,
      done: this.done,
      execute: this.mutate
    });

    if (Array.isArray(slot)) {
      return h('div', {}, slot);
    }

    return slot;
  }
};
