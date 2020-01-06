import { provide } from 'vue';
import { createClient, VqlClientOptions } from './client';

export function useClient(opts: VqlClientOptions) {
  const client = createClient(opts);
  provide('$villus', client);
}
