import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode, print } from 'graphql';

/**
 * Normalizes a query string or object to a string.
 */
export function normalizeQuery(query: string | DocumentNode | TypedDocumentNode): string | null {
  if (typeof query === 'string') {
    return query;
  }

  if (query && query.kind) {
    return print(query);
  }

  return null;
}
