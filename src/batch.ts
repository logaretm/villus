import { Fetcher, GraphQLResponse } from './types';
import { resolveGlobalFetch, DEFAULT_FETCH_OPTS, parseResponse } from './utils';

interface BatchOptions {
  fetch?: Fetcher;
  timeout?: number;
}

type BatchedGraphQLResponse = GraphQLResponse<any>[];

const defaultOpts = (): BatchOptions => ({
  fetch: resolveGlobalFetch(),
  timeout: 10
});

export function batcher(opts?: BatchOptions): Fetcher {
  const { fetch, timeout } = { ...defaultOpts(), ...(opts || {}) };
  if (!fetch) {
    throw new Error('Could not resolve fetch, please provide a fetch function');
  }

  let operations: { resolve: (r: any) => void; body: string }[] = [];
  let scheduledConsume: number;

  return function batchedFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    return new Promise(resolve => {
      if (scheduledConsume) {
        clearTimeout(scheduledConsume);
      }

      const operationIndex = operations.length;
      operations.push({ resolve, body: init?.body as string });
      scheduledConsume = setTimeout(async () => {
        const pending = operations;
        const body = `[${operations.map(o => o.body).join(',')}]`;
        operations = [];
        const res = await fetch(url, {
          method: DEFAULT_FETCH_OPTS.method,
          headers: {
            ...DEFAULT_FETCH_OPTS.headers
          },
          ...opts,
          body
        });

        parseResponse<any>(res).then(response => {
          const resInit: ResponseInit = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          };

          pending.forEach(o => {
            o.resolve({
              json: () => ((response.body as unknown) as BatchedGraphQLResponse)[operationIndex],
              ...resInit
            });
          });
        });
      }, timeout);
    });
  };
}
