import { OperationResult, Operation } from './types';
import { getQueryKey } from './utils';

interface ResultCache {
  [k: string]: OperationResult;
}

export function makeCache() {
  const resultCache: ResultCache = {};

  function afterQuery(operation: Operation, result: OperationResult) {
    const key = getQueryKey(operation);

    resultCache[key] = result;
  }

  function getCachedResult(operation: Operation): OperationResult | undefined {
    const key = getQueryKey(operation);

    return resultCache[key];
  }

  return {
    afterQuery,
    getCachedResult,
  };
}
