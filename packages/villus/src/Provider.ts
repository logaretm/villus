import { defineComponent, h, SetupContext } from 'vue-demi';
import { normalizeChildren } from './utils';
import { useClient } from './useClient';
import { CachePolicy, ClientPlugin } from './types';
import { ClientOptions } from './client';

export const Provider = defineComponent({
  name: 'VillusClientProvider',
  props: {
    url: {
      type: String,
      required: true,
    },
    cachePolicy: {
      type: String,
      default: '' as CachePolicy,
    },
    use: {
      type: Array,
      default: undefined,
    },
  },
  setup(props, ctx: SetupContext) {
    useClient({
      url: props.url,
      cachePolicy: props.cachePolicy as CachePolicy,
      use: props.use as ClientPlugin[],
    });

    return () => {
      return normalizeChildren(ctx, {});
    };
  },
});

export function withProvider(component: any, clientOpts: ClientOptions) {
  return defineComponent({
    name: 'VillusWithClientHoc',
    setup(props, ctx: SetupContext) {
      useClient(clientOpts);

      return () => {
        return h(component, { ...props, ...ctx.attrs }, ctx.slots);
      };
    },
  });
}
