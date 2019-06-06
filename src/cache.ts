import { OperationResult, Operation } from './types';
import { getQueryKey } from './utils';

type ResultCache = Map<number, OperationResult>;

export function makeCache() {
  let resultCache = new Map() as ResultCache;

  function afterQuery(operation: Operation, result: OperationResult) {
    const key = getQueryKey(operation);

    resultCache.set(key, result);
  }

  function getCachedResult(operation: Operation): OperationResult | undefined {
    const key = getQueryKey(operation);

    return resultCache.get(key);
  }

  return {
    afterQuery,
    getCachedResult
  };
}
