export const Query = {
  name: 'VqlQuery',
  inject: ['$vql'],
  props: {
    query: {
      type: String,
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
    isFetching: false,
    isDone: false
  }),
  serverPrefetch(this: any) {
    // fetch it on the serverside.
    return this.fetch();
  },
  methods: {
    async fetch(this: any) {
      if (!this.$vql) {
        throw new Error('Could not find the VQL client, did you install the plugin correctly?');
      }

      try {
        this.isFetching = true;
        const { data, errors } = await this.$vql.query({
          query: this.query,
          variables: this.variables ? this.variables : undefined
        });

        this.data = data;
        this.errors = errors;
      } catch (err) {
        this.errors = [err.message];
        this.data = null;
      } finally {
        this.isDone = true;
        this.isFetching = false;
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
      isFetching: this.isFetching,
      isDone: this.isDone
    });

    return h('div', {}, slot);
  }
};
