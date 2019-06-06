/**
 * Normalizes a list of variable objects.
 */
export function normalizeVariables(...variables: object[]) {
  let normalized = undefined;
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
export function normalizeQuery(query: string | { loc: any }): string | null {
  if (typeof query === 'string') {
    return query;
  }

  if (query.loc) {
    return query.loc.source.body;
  }

  return null;
}
