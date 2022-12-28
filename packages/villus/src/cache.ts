import { OperationResult, ClientPlugin, ClientPluginContext, ClientPluginOperation } from './types';

interface ResultCache {
  [k: string]: OperationResult;
}

export function cache(): ClientPlugin & { clearCache(): void } {
  let resultCache: ResultCache = {};

  function setCacheResult({ key }: ClientPluginOperation, result: OperationResult) {
    resultCache[key] = result;
  }

  function getCachedResult({ key }: ClientPluginOperation): OperationResult | undefined {
    return resultCache[key];
  }

  function clearCache() {
    resultCache = {};
  }

  function cachePlugin({ afterQuery, useResult, operation }: ClientPluginContext) {
    if (operation.type !== 'query' || operation.cachePolicy === 'network-only') {
      return;
    }

    // Set the cache result after query is resolved
    afterQuery(result => {
      setCacheResult(operation, result);
    });

    // Get cached item
    const cachedResult = getCachedResult(operation);
    if (operation.cachePolicy === 'cache-only') {
      return useResult(cachedResult || { data: null, error: null }, true);
    }

    // if exists in cache, terminate with result
    if (cachedResult) {
      return useResult(cachedResult, operation.cachePolicy === 'cache-first');
    }
  }

  cachePlugin.clearCache = clearCache;

  return cachePlugin;
}
