import { OperationResult, ClientPlugin, ClientPluginContext, ClientPluginOperation } from './types';
import { arrayToExistHash } from './utils';

interface ResultCache {
  [k: string]: { result: OperationResult; tags?: string[] };
}

export function cache(): ClientPlugin & { clearCache(tags?: string | string[]): void } {
  let resultCache: ResultCache = {};

  function setCacheResult({ key, cacheTags }: ClientPluginOperation, result: OperationResult) {
    resultCache[key] = { result, tags: cacheTags };
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
    if (operation.cachePolicy === 'network-only') {
      return;
    }

    if (operation.type === 'mutation') {
      if (operation.cacheTags?.length) {
        afterQuery(result => {
          if (result.data) {
            clearCache(operation.cacheTags);
          }
        });
      }

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
