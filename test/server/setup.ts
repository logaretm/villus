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
  // setup a fetch mock
  (global as any).fetch = jest.fn(async function mockedAPI(url: string, opts: RequestInit) {
    const body = JSON.parse(opts.body as string);
    const res = await server.query(body.query, body.variables);

    return Promise.resolve({
      json() {
        return res;
      }
    });
  });
});
