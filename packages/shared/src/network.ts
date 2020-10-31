import { normalizeQuery } from '../../villus/src/utils/query';
import { FetchOptions, GraphQLResponse, ParsedResponse, Operation } from './types';

export async function parseResponse<TData>(response: Response): Promise<ParsedResponse<TData>> {
  let json: GraphQLResponse<TData>;
  const responseData = {
    ok: response.ok,
    statusText: response.statusText,
    status: response.status,
    headers: response.headers,
  };

  try {
    json = await response.json();
  } catch (err) {
    return {
      ...responseData,
      statusText: err.message,
      body: null,
    };
  }

  return {
    ...responseData,
    body: json,
  };
}

export function resolveGlobalFetch(): typeof fetch | undefined {
  if (typeof window !== 'undefined' && 'fetch' in window && window.fetch) {
    return window.fetch.bind(window);
  }

  if (typeof global !== 'undefined' && 'fetch' in global) {
    return (global as any).fetch;
  }

  return undefined;
}

export const DEFAULT_FETCH_OPTS = {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
} as const;

export function mergeFetchOpts(lhs: FetchOptions, rhs: FetchOptions) {
  return {
    ...lhs,
    ...rhs,
    method: rhs.method || lhs.method || DEFAULT_FETCH_OPTS.method,
    headers: {
      ...(lhs.headers || {}),
      ...(rhs.headers || {}),
    },
  };
}

export function makeFetchOptions({ query, variables }: Operation<unknown, unknown>, opts: FetchOptions) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('A query must be provided.');
  }

  return mergeFetchOpts({ body: JSON.stringify({ query: normalizedQuery, variables }) } as any, opts);
}
