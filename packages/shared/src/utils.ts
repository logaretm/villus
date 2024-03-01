import { DocumentNode, print } from 'graphql';
import { DocumentDecoration } from './types';

/**
 * Normalizes a query string or object to a string.
 */
export function normalizeQuery(query: string | DocumentNode | DocumentDecoration<any, any>): string | null {
  if (typeof query === 'string') {
    return query;
  }

  // Supports typed document strings in 3.2
  if (query && query instanceof String) {
    return query.toString();
  }

  if (query && 'kind' in query) {
    return print(query);
  }

  return null;
}
