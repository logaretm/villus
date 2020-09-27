import { mockServer, MockList } from 'graphql-tools';
import schema from './schema';

const server = mockServer(schema, {
  Post: () => ({
    id: () => Math.random().toString(36).substring(7),
    title: () => 'Hello World',
    slug: () => 'hello-world',
  }),
  Query: () => ({
    posts: () => new MockList(5),
    post: (_: any, { id }: any) => {
      return {
        id,
        title: `Hello World: ${id}`,
        slug: 'hello-world',
      };
    },
  }),
  Mutation: () => ({
    likePost: () => ({
      success: true,
      code: '200',
      message: 'Operation successful',
    }),
  }),
});

beforeEach(() => {
  const fetchController = {
    simulateNetworkError: false,
    simulateParseError: false,
  };

  (global as any).fetchController = fetchController;

  // setup a fetch mock
  (global as any).fetch = jest.fn(async function mockedAPI(url: string, opts: RequestInit) {
    if (fetchController.simulateNetworkError) {
      throw new Error('Network Error');
    }

    let body: any[] = JSON.parse(opts.body as string);
    const isBatched = Array.isArray(body);
    if (!Array.isArray(body)) {
      body = [body];
    }

    const res = await Promise.all(
      body.map(op => {
        return server.query(op.query, op.variables);
      })
    );

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json() {
        if (fetchController.simulateParseError) {
          throw new Error('Error parsing, unexpected token <');
        }

        return isBatched ? res : res[0];
      },
    });
  });

  (global as any).sleep = (time: number) =>
    new Promise(resolve => {
      setTimeout(resolve, time);
    });
});
