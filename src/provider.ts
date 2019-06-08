import { VqlClient } from './client';
import Vue from 'vue';
import { normalizeChildren } from './utils';

export const Provider = Vue.extend({
  name: 'VqlProvider',
  props: {
    client: {
      type: VqlClient,
      required: true
    }
  },
  provide() {
    return {
      $vql: (this as any).client as VqlClient
    };
  },
  render(h: any) {
    const children = normalizeChildren(this, {});
    if (!children.length) {
      return h();
    }

    return children.length <= 1 ? children[0] : h('span', children);
  }
});

export const withProvider = (component: any, client: VqlClient) => {
  const options = 'options' in component ? component.options : component;

  return Vue.extend({
    name: 'withVqlProviderHoC',
    functional: true,
    render(h: any) {
      return h(Provider, {
        props: {
          client
        },
        scopedSlots: {
          default: () => h(options)
        }
      });
    }
  });
};
