import { DocumentNode, print } from 'graphql';
import stringify from 'fast-json-stable-stringify';
import { SetupContext } from 'vue';
import { Operation } from './types';

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
  const variables = operation.variables ? stringify(operation.variables) : '';
  const query = normalizeQuery(operation.query);

  return hash(`${query}${variables}`);
}

export function normalizeChildren(context: SetupContext, slotProps: any) {
  if (!context.slots.default) {
    return [];
  }

  return context.slots.default(slotProps) || [];
}
