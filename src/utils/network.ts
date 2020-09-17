import { GraphQLResponse, Operation, FetchOptions, Fetcher } from '../types';
import { normalizeQuery } from './query';

interface ParsedResponse<TData> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: GraphQLResponse<TData> | null;
}

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

export function resolveGlobalFetch(): Fetcher | undefined {
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

export function makeFetchOptions({ query, variables }: Operation, opts: FetchOptions) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('A query must be provided.');
  }

  return {
    method: DEFAULT_FETCH_OPTS.method,
    body: JSON.stringify({ query: normalizedQuery, variables }),
    ...opts,
    headers: {
      ...DEFAULT_FETCH_OPTS.headers,
      ...opts.headers,
    },
  };
}
