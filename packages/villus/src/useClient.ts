import { provide } from 'vue';
import { createClient, ClientOptions } from './client';
import { VILLUS_CLIENT } from './symbols';

export function useClient(opts: ClientOptions) {
  const client = createClient(opts);
  provide(VILLUS_CLIENT, client);

  return client;
}
