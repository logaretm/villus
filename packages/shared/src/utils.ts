import type { TypedDocumentNode, DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { DocumentNode, print } from 'graphql';

/**
 * Normalizes a query string or object to a string.
 */
export function normalizeQuery(
  query: string | DocumentNode | TypedDocumentNode | DocumentTypeDecoration<any, any>
): string | null {
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
