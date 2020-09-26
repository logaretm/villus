import { ClientPlugin, Fetcher, FetchOptions, Operation } from './types';
import { CombinedError, mergeFetchOpts, normalizeQuery, parseResponse, resolveGlobalFetch } from './utils';

interface FetchPluginOpts {
  fetch?: Fetcher;
}

export function fetch(opts?: FetchPluginOpts): ClientPlugin {
  const fetch = opts?.fetch || resolveGlobalFetch();
  if (!fetch) {
    throw new Error('Could not resolve a fetch() method, you should provide one.');
  }

  return async function fetchPlugin({ useResult, opContext, operation }) {
    let fetchOpts = opContext;
    if (!opContext.body) {
      fetchOpts = makeFetchOptions(operation, opContext);
    }

    let response;
    try {
      response = await fetch(opContext.url, fetchOpts).then(parseResponse);
    } catch (err) {
      return useResult(
        {
          data: null,
          error: new CombinedError({ response, networkError: err }),
        },
        true
      );
    }

    if (!response.ok || !response.body) {
      return useResult(
        {
          data: null,
          error: new CombinedError({ response: response, networkError: new Error(response.statusText) }),
        },
        true
      );
    }

    useResult(
      {
        data: response.body.data,
        error: response.body.errors
          ? new CombinedError({ response: response, graphqlErrors: response.body.errors })
          : null,
      },
      true
    );
  };
}

export function makeFetchOptions({ query, variables }: Operation<unknown>, opts: FetchOptions) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('A query must be provided.');
  }

  return {
    ...mergeFetchOpts({} as any, opts),
    body: JSON.stringify({ query: normalizedQuery, variables }),
  };
}
