import { DocumentNode } from 'graphql';
import { Operation } from './types';
import Vue from 'vue';

/**
 * Normalizes a list of variable objects.
 */
export function normalizeVariables(...variables: object[]) {
  let normalized;
  const length = variables.length;
  for (let i = 0; i < length; i++) {
    if (!normalized) {
      normalized = {};
    }

    normalized = { ...normalized, ...variables[i] };
  }

  return normalized;
}

/**
 * Normalizes a query string or object to a string.
 */
export function normalizeQuery(query: string | DocumentNode): string | null {
  if (typeof query === 'string') {
    return query;
  }

  if (query.loc) {
    return query.loc.source.body;
  }

  return null;
}

export function hash(x: string) {
  // tslint:disable-next-line
  let h, i, l;
  // tslint:disable-next-line
  for (h = 5381 | 0, i = 0, l = x.length | 0; i < l; i++) {
    h = (h << 5) + h + x.charCodeAt(i);
  }

  return h >>> 0;
}

export function getQueryKey(operation: Operation) {
  const variables = operation.variables ? JSON.stringify(operation.variables) : '';

  return hash(`${operation.query}${variables}`);
}

export function normalizeChildren(context: Vue, slotProps: any) {
  if (context.$scopedSlots.default) {
    return context.$scopedSlots.default(slotProps) || [];
  }

  return context.$slots.default || [];
}
