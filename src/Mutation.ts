import Vue, { VueConstructor } from 'vue';
import { VqlClient } from './client';
import { normalizeChildren, CombinedError } from './utils';

type withVqlClient = VueConstructor<
  Vue & {
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

export const Mutation = (Vue as withVqlClient).extend({
  name: 'Mutation',
  inject: ['$villus'],
  props: {
    query: {
      type: [String, Object],
      required: true
    }
  },
  data: componentData,
  methods: {
    async mutate(vars: object = {}) {
      if (!this.$villus) {
        throw new Error('Could not find the villus client, did you install the plugin correctly?');
      }

      try {
        this.data = null;
        this.error = null;
        this.fetching = true;
        this.done = false;
        const { data, error } = await this.$villus.executeMutation({
          query: this.query,
          variables: vars || undefined
        });

        this.data = data;
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.error = error;
        this.done = true;
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.error = new CombinedError({ networkError: err, response: null });
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
      error: this.error,
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
