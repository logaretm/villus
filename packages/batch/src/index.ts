import { makeFetchOptions } from '../../villus/src/fetch';
import { ClientPlugin, Fetcher, GraphQLResponse } from '../../villus/src/types';
import { resolveGlobalFetch, parseResponse, CombinedError } from '../../villus/src/utils';

interface BatchOptions {
  fetch?: Fetcher;
  timeout?: number;
}

type BatchedGraphQLResponse = GraphQLResponse<unknown>[];

const defaultOpts = (): BatchOptions => ({
  fetch: resolveGlobalFetch(),
  timeout: 10,
});

export function batch(opts?: BatchOptions): ClientPlugin {
  const { fetch, timeout } = { ...defaultOpts(), ...(opts || {}) };
  if (!fetch) {
    throw new Error('Could not resolve fetch, please provide a fetch function');
  }

  let operations: { resolveOp: (r: any) => void; body: string }[] = [];
  let scheduledConsume: any;

  return function batchPlugin({ useResult, opContext, operation }) {
    return new Promise(resolve => {
      if (scheduledConsume) {
        clearTimeout(scheduledConsume);
      }

      if (!opContext.body) {
        opContext.body = makeFetchOptions(operation, opContext).body;
      }

      operations.push({
        resolveOp: (response: any) => {
          resolve();
          if (!response.ok || !response.body) {
            useResult(
              {
                data: null,
                error: new CombinedError({
                  response: response,
                  networkError: new Error(response.statusText),
                }),
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
        },
        body: opContext.body as string,
      });

      scheduledConsume = setTimeout(async () => {
        const pending = operations;
        const body = `[${operations.map(o => o.body).join(',')}]`;
        operations = [];

        const res = await fetch(opContext.url as string, {
          method: opContext.method,
          headers: {
            ...opContext.headers,
          },
          body,
        });

        const response = await parseResponse<any>(res);
        const resInit: Partial<Response> = {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };

        pending.forEach(function unBatchResult(o, oIdx) {
          const opResult = ((response.body as unknown) as BatchedGraphQLResponse)[oIdx];

          o.resolveOp({
            body: opResult,
            ...resInit,
          });
        });
      }, timeout);
    });
  };
}
