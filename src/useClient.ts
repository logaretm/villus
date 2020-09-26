import { provide } from 'vue-demi';
import { createClient, ClientOptions, Client } from './client';

export function useClient(opts: ClientOptions | Client) {
  const client = opts instanceof Client ? opts : createClient(opts);
  provide('$villus', client);

  return client;
}
