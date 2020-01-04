import { createClient, VqlClientOptions } from './client';
import { provide } from '@vue/composition-api';

export function useClient(opts: VqlClientOptions) {
  const client = createClient(opts);
  provide('$villus', client);
}
