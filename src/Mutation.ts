import Vue, { VueConstructor } from 'vue';
import { VqlClient } from './client';
import { normalizeQuery, normalizeChildren } from './utils';

type withVqlClient = VueConstructor<
  Vue & {
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

export const Mutation = (Vue as withVqlClient).extend({
  name: 'Mutation',
  inject: ['$vql'],
  props: {
    query: {
      type: [String, Object],
      required: true
    }
  },
  data: componentData,
  methods: {
    async mutate(vars: object = {}) {
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
  render(h) {
    const children = normalizeChildren(this, {
      data: this.data,
      errors: this.errors,
      fetching: this.fetching,
      done: this.done,
      execute: this.mutate
    });

    if (!children.length) {
      return h();
    }

    return children.length === 1 ? children[0] : h('span', children);
  }
});
