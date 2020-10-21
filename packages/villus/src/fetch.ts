import { GraphQLError } from 'graphql';
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

  return async function fetchPlugin(ctx) {
    const { useResult, opContext, operation } = ctx;
    const fetchOpts = makeFetchOptions(operation, opContext);

    let response;
    try {
      response = await fetch(opContext.url as string, fetchOpts).then(parseResponse);
    } catch (err) {
      return useResult(
        {
          data: null,
          error: new CombinedError({ response, networkError: err }),
        },
        true
      );
    }

    // Set the response on the context
    ctx.response = response;
    if (!response.ok || !response.body) {
      // It is possible than a non-200 response is returned with errors, it should be treated as GraphQL error
      const ctorOptions: { response: typeof response; graphqlErrors?: GraphQLError[]; networkError?: Error } = {
        response,
      };

      if (response.body?.errors) {
        ctorOptions.graphqlErrors = response.body.errors;
      } else {
        ctorOptions.networkError = new Error(response.statusText);
      }

      return useResult(
        {
          data: null,
          error: new CombinedError(ctorOptions),
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

export function makeFetchOptions({ query, variables }: Operation<unknown, unknown>, opts: FetchOptions) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    throw new Error('A query must be provided.');
  }

  return mergeFetchOpts({ body: JSON.stringify({ query: normalizedQuery, variables }) } as any, opts);
}
