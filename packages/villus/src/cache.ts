import { OperationResult, ClientPlugin, ClientPluginContext, ClientPluginOperation } from './types';
import { arrayToExistHash } from './utils';

interface ResultCache {
  [k: string]: { result: OperationResult; tags?: string[] };
}

export function cache(): ClientPlugin & { clearCache(tags?: string | string[]): void } {
  let resultCache: ResultCache = {};

  function setCacheResult({ key, tags }: ClientPluginOperation & { type: 'query' }, result: OperationResult) {
    resultCache[key] = { result, tags };
  }

  function getCachedResult({ key }: ClientPluginOperation): OperationResult | undefined {
    return resultCache[key]?.result;
  }

  function clearCache(tags?: string | string[]) {
    if (!tags) {
      resultCache = {};
      return;
    }

    const tagArray = Array.isArray(tags) ? tags : [tags];
    if (!tagArray.length) {
      return;
    }

    const tagsLookup = arrayToExistHash(tagArray);

    // clears cache keys one by one
    Object.keys(resultCache).forEach(key => {
      const cacheItem = resultCache[key];
      if (!cacheItem.tags) {
        return;
      }

      const tagExists = cacheItem.tags.some(t => tagsLookup[t]);
      if (tagExists) {
        delete resultCache[key];
      }
    });
  }

  function cachePlugin({ afterQuery, useResult, operation }: ClientPluginContext) {
    if (operation.type === 'mutation' && operation.clearCacheTags?.length) {
      afterQuery(result => {
        // only after successful operation
        if (result.data) {
          clearCache(operation.clearCacheTags);
        }
      });

      return;
    }

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
  
  cachPlugin.setCacheResult = function (operation, result) {
    // getQueryKey imported from utils
    const key = operation.key || getQueryKey(operation);
    setCacheResult({ key, ...operation }, result);
  }

  return cachePlugin;
}
