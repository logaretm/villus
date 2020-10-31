import { GraphQLResponse, FetchOptions, ParsedResponse } from '../types';

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
