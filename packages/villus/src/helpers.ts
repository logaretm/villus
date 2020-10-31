import { ClientPlugin } from './types';

export function definePlugin(fn: ClientPlugin) {
  return fn;
}
