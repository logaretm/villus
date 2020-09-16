import { provide } from 'vue-demi';
import { createClient, VqlClientOptions, VqlClient } from './client';

export function useClient(opts: VqlClientOptions | VqlClient) {
  const client = opts instanceof VqlClient ? opts : createClient(opts);
  provide('$villus', client);

  return client;
}
