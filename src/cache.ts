import { OperationResult } from './types';

type ResultCache = Map<string, OperationResult>;

export function makeCache() {
  let resultCache = new Map() as ResultCache;

  function afterQuery(query: string, result: OperationResult) {
    resultCache.set(query, result);
  }

  function getCachedResult(query: string): OperationResult | undefined {
    return resultCache.get(query);
  }

  return {
    afterQuery,
    getCachedResult
  };
}
