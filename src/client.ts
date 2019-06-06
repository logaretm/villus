type Fetcher = typeof fetch;

interface FetchOptions extends Omit<RequestInit, 'body'> {}

interface GraphQLRequestContext {
  fetchOptions?: FetchOptions;
}

type ContextFactory = () => GraphQLRequestContext;

interface VqlClientOptions {
  url: string;
  fetch?: Fetcher;
  context?: ContextFactory;
}

interface ClientQueryOptions {
  query: string;
  variables?: { [k: string]: any };
}

function resolveGlobalFetch(): Fetcher | undefined {
  // tslint:disable-next-line
  if (typeof window !== 'undefined' && 'fetch' in window) {
    return window.fetch.bind(window);
  }

  // tslint:disable-next-line
  if (typeof global !== 'undefined' && 'fetch' in global) {
    return (global as any).fetch;
  }

  return undefined;
}

export class VqlClient {
  url: string;
  fetch: Fetcher;
  context?: ContextFactory;

  constructor(url: string, fetch: Fetcher, context?: ContextFactory) {
    this.url = url;
    this.fetch = fetch;
    this.context = context;
  }

  makeFetchOptions({ query, variables }: ClientQueryOptions, opts: FetchOptions) {
    return {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      ...opts,
      headers: {
        'content-type': 'application/json',
        ...opts.headers
      }
    };
  }

  query(operation: ClientQueryOptions) {
    const fetchOptions = this.context ? this.context().fetchOptions : {};
    const opts = this.makeFetchOptions(operation, fetchOptions || {});

    return this.fetch(this.url, opts).then(response => response.json());
  }
}

export function createClient({ url = '/graphql', fetch = resolveGlobalFetch(), context }: VqlClientOptions) {
  if (!fetch) {
    throw new Error('Could not resolve a fetch() method, you should provide one.');
  }

  return new VqlClient(url, fetch, context);
}
