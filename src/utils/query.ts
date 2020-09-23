import { DocumentNode, print } from 'graphql';
import stringify from 'fast-json-stable-stringify';
import { Operation } from '../types';

/**
 * Normalizes a query string or object to a string.
 */
export function normalizeQuery(query: string | DocumentNode): string | null {
  if (typeof query === 'string') {
    return query;
  }

  if (query && query.loc) {
    return print(query);
  }

  return null;
}

export function hash(x: string) {
  let h, i, l;
  for (h = 5381 | 0, i = 0, l = x.length | 0; i < l; i++) {
    h = (h << 5) + h + x.charCodeAt(i);
  }

  return h >>> 0;
}

export function getQueryKey(operation: Operation) {
  const variables = operation.variables ? safeStringify(operation.variables) : '';
  const query = normalizeQuery(operation.query);

  return hash(`${query}${variables}`);
}

/**
 * Uses `stringify` if available, otherwise uses `JSON.stringify`
 */
function safeStringify(val: any) {
  return stringify ? stringify(val) : JSON.stringify(val);
}
