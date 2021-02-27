import { GraphQLError } from 'graphql';
import { ClientPlugin } from './types';
import { makeFetchOptions, resolveGlobalFetch, parseResponse } from '../../shared/src';
import { CombinedError } from './utils';

interface FetchPluginOpts {
  fetch?: typeof window['fetch'];
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
    const data = response.body?.data;
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
          data,
          error: new CombinedError(ctorOptions),
        },
        true
      );
    }

    useResult(
      {
        data,
        error: response.body.errors
          ? new CombinedError({ response: response, graphqlErrors: response.body.errors })
          : null,
      },
      true
    );
  };
}
