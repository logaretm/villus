import { mockServer, MockList } from 'graphql-tools';
import schema from './schema';

const server = mockServer(schema, {
  Post: () => ({
    id: () =>
      Math.random()
        .toString(36)
        .substring(7),
    title: () => 'Hello World',
    slug: () => 'hello-world'
  }),
  Query: () => ({
    posts: () => new MockList(5),
    post: (_: any, { id }: any) => {
      return {
        id,
        title: `Hello World: ${id}`,
        slug: 'hello-world'
      };
    }
  }),
  Mutation: () => ({
    likePost: () => ({
      success: true,
      code: '200',
      message: 'Operation successful'
    })
  })
});

beforeEach(() => {
  const fetchController = {
    simulateNetworkError: false
  };

  (global as any).fetchController = fetchController;

  // setup a fetch mock
  (global as any).fetch = jest.fn(async function mockedAPI(url: string, opts: RequestInit) {
    if (fetchController.simulateNetworkError) {
      throw new Error('Network Error');
    }

    const body = JSON.parse(opts.body as string);
    const res = await server.query(body.query, body.variables);

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json() {
        return res;
      }
    });
  });

  (global as any).sleep = (time: number) =>
    new Promise(resolve => {
      setTimeout(resolve, time);
    });
});
