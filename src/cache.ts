import { OperationResult, Operation, ClientPlugin, QueryVariables, CachePolicy } from './types';
import { getQueryKey } from './utils';

interface ResultCache {
  [k: string]: OperationResult;
}

export interface CachedOperation<TVars = QueryVariables> extends Operation<TVars> {
  cachePolicy?: CachePolicy;
}

export function cache(): ClientPlugin {
  const resultCache: ResultCache = {};

  function setCacheResult(operation: Operation<unknown>, result: OperationResult) {
    const key = getQueryKey(operation);

    resultCache[key] = result;
  }

  function getCachedResult(operation: Operation<unknown>): OperationResult | undefined {
    const key = getQueryKey(operation);

    return resultCache[key];
  }

  return function cachePlugin({ afterQuery, useResult, operation }) {
    if (operation.type !== 'query' || operation.cachePolicy === 'network-only') {
      return;
    }

    // Set the cache result after query is resolved
    afterQuery(result => {
      setCacheResult(operation, result);
    });

    // Get cached item
    const cachedResult = getCachedResult(operation);

    // if exists in cache, terminate with result
    if (cachedResult) {
      return useResult(cachedResult, true, operation.cachePolicy === 'cache-first');
    }
  };
}
