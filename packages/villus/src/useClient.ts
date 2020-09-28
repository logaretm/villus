import { provide } from 'vue-demi';
import { createClient, ClientOptions } from './client';

export function useClient(opts: ClientOptions) {
  const client = createClient(opts);
  provide('$villus', client);

  return client;
}
