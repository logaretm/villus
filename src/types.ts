export interface OperationResult {
  data: any;
  errors: any;
}

export type CachePolicy = 'cache-and-network' | 'network-only' | 'cache-first';

export interface Operation {
  query: string;
  variables?: { [k: string]: any };
  cachePolicy?: CachePolicy;
}
