import { SetupContext } from 'vue';
import { VqlClient } from './client';
import { normalizeChildren } from './utils';
import { useClient } from './useClient';

interface ProviderProps {
  client: VqlClient;
}

export const Provider = {
  name: 'VqlProvider',
  props: {
    client: {
      type: VqlClient,
      required: true
    }
  },
  setup(props: ProviderProps, ctx: SetupContext) {
    useClient(props.client);

    return () => {
      return normalizeChildren(ctx, {});
    };
  }
};
