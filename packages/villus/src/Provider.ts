import { defineComponent, h, SetupContext } from 'vue-demi';
import { Client } from './client';
import { normalizeChildren } from './utils';
import { useClient } from './useClient';

interface ProviderProps {
  client: Client;
}

export const Provider = {
  name: 'VillusClientProvider',
  props: {
    client: {
      type: Client,
      required: true,
    },
  },
  setup(props: ProviderProps, ctx: SetupContext) {
    useClient(props.client);

    return () => {
      return normalizeChildren(ctx, {});
    };
  },
};

export function withProvider(component: any, client: Client) {
  return defineComponent({
    setup(props, ctx: SetupContext) {
      useClient(client);

      return () => {
        return h(component, { ...props, ...ctx.attrs }, ctx.slots);
      };
    },
  });
}
