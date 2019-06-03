import { VqlClient } from './client';

export const Provider = {
  name: 'VqlProvider',
  props: {
    client: {
      type: VqlClient,
      required: true
    }
  },
  provide(this: any) {
    return {
      $vql: this.client
    };
  },
  render(this: any, h: any) {
    let rootNode = this.$scopedSlots.default();
    rootNode = Array.isArray(rootNode) ? rootNode[0] : rootNode;

    return h(rootNode);
  }
};
