import { GraphQLError } from 'graphql';
import { ClientPluginContext, CombinedError, ClientPluginOperation, definePlugin, fetch as fetchPlugin } from 'villus';
import {
  GraphQLResponse,
  makeFetchOptions,
  mergeFetchOpts,
  ParsedResponse,
  parseResponse,
  resolveGlobalFetch,
} from '../../shared/src';

interface BatchOptions {
  fetch?: typeof fetch;
  timeout: number;
  maxOperationCount: number;
  exclude?: (op: ClientPluginOperation, ctx: ClientPluginContext) => boolean;
}

type BatchedGraphQLResponse = GraphQLResponse<unknown>[];

const defaultOpts = (): BatchOptions => ({
  fetch: resolveGlobalFetch(),
  timeout: 10,
  maxOperationCount: 10,
});

export function batch(opts?: Partial<BatchOptions>) {
  const { fetch, timeout, maxOperationCount } = { ...defaultOpts(), ...(opts || {}) };
  const fetchPluginInstance = fetchPlugin({ fetch });

  let operations: { resolveOp: (r: any, opIdx: number, err?: Error) => void; body: string }[] = [];
  let scheduledConsume: any;

  return definePlugin(function batchPlugin(ctx) {
    const { useResult, opContext, operation } = ctx;

    if (opts?.exclude?.(ctx.operation, ctx)) {
      return fetchPluginInstance(ctx);
    }

    async function consume() {
      const pending = operations;
      const body = `[${operations.map(o => o.body).join(',')}]`;
      const fetchOpts = mergeFetchOpts(opContext, { headers: {}, body });
      operations = [];

      if (!fetch) {
        throw new Error('Could not resolve fetch, please provide a fetch function');
      }

      let response: ParsedResponse<unknown>;
      try {
        response = await fetch(opContext.url as string, fetchOpts).then(parseResponse);

        ctx.response = response;
        const resInit: Partial<Response> = {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };

        pending.forEach(function unBatchResult(o, oIdx) {
          const opResult = (response.body as unknown as BatchedGraphQLResponse | null)?.[oIdx];
          // the server returned a non-json response or an empty one
          if (!opResult) {
            o.resolveOp(
              {
                ...resInit,
                body: response.body,
              },
              oIdx,
              new Error('Received empty response for this operation from server'),
            );
            return;
          }

          o.resolveOp(
            {
              body: opResult,
              ...resInit,
            },
            oIdx,
          );
        });
      } catch (err) {
        // This usually mean a network fetch error which is limited to DNS lookup errors
        // or the user may not be connected to the internet, so it's safe to assume no data is in the response
        pending.forEach(function unBatchErrorResult(o, oIdx) {
          o.resolveOp(undefined, oIdx, err as Error);
        });
      }
    }

    return new Promise(resolve => {
      if (scheduledConsume) {
        clearTimeout(scheduledConsume);
      }

      if (operations.length >= maxOperationCount) {
        // consume the old array
        consume();
      }

      if (!opContext.body) {
        opContext.body = makeFetchOptions(operation, opContext).body;
      }

      operations.push({
        resolveOp: (response: ParsedResponse<unknown>, opIdx, err) => {
          resolve(undefined);
          // Handle DNS errors
          if (err) {
            useResult(
              {
                data: null,
                error: new CombinedError({
                  response,
                  networkError: err,
                }),
              },
              true,
            );
            return;
          }

          const data = response.body?.data || null;
          if (!response.ok || !response.body) {
            const error = buildErrorObject(response, opIdx);

            useResult(
              {
                data,
                error,
              },
              true,
            );
            return;
          }

          useResult(
            {
              data,
              error: response.body.errors ? new CombinedError({ response, graphqlErrors: response.body.errors }) : null,
            },
            true,
          );
        },
        body: opContext.body as string,
      });

      scheduledConsume = setTimeout(consume, timeout);
    });
  });
}

function buildErrorObject(response: ParsedResponse<unknown>, opIdx: number) {
  // It is possible than a non-200 response is returned with errors, it should be treated as GraphQL error
  const ctorOptions: { response: typeof response; graphqlErrors?: GraphQLError[]; networkError?: Error } = {
    response,
  };

  if (Array.isArray(response.body)) {
    const opResponse = response.body[opIdx];
    ctorOptions.graphqlErrors = opResponse?.errors;
  } else if (response.body?.errors) {
    ctorOptions.graphqlErrors = response.body.errors;
  } else {
    ctorOptions.networkError = new Error(response.statusText);
  }

  return new CombinedError(ctorOptions);
}
