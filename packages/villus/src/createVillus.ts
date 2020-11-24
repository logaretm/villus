import { App } from 'vue-demi';
import { createClient, ClientOptions } from './client';
import { VILLUS_CLIENT } from './symbols';

export function createVillus(opts: ClientOptions) {
  const client = createClient(opts);

  return {
    install: (app: App) => {
      app.provide(VILLUS_CLIENT, client);
    },
  };
}
