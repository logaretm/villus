import { mockServer, MockList, makeExecutableSchema } from 'graphql-tools';
import { GraphQLUpload } from 'graphql-upload';

const schema = makeExecutableSchema({
  typeDefs: `
    scalar Upload
    
    type Post {
      id: ID!
      title: String!
      slug: String!
      isLiked: Boolean!
    }

    type File {
      path: String!
    }

    type Query {
      posts: [Post]!

      post (id: ID!): Post!
    }

    type LikePostMutationResponse {
      success: Boolean!
      code: String!
      message: String!
      post: Post
    }

    type Mutation {
      likePost (id: ID!): LikePostMutationResponse!

      singleUpload(file: Upload!): File!
    }
  `,
  resolvers: {
    Upload: GraphQLUpload,
  },
});

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
    singleUpload: (_: any, args: any) => {
      return {
        path: 'hello-world.ts',
      };
    },
  }),
});

beforeEach(() => {
  const fetchController = {
    simulateNetworkError: false,
    simulateParseError: false,
    // #49
    simulateNetworkErrorWithGraphQLResponse: false,
  };

  const headers = new Headers({
    'content-type': 'application/json',
  });

  (global as any).fetchController = fetchController;

  // setup a fetch mock
  (global as any).fetch = jest.fn(async function mockedAPI(url: string, opts: RequestInit) {
    if (fetchController.simulateNetworkError) {
      throw new Error('Network Error');
    }

    if (fetchController.simulateNetworkErrorWithGraphQLResponse) {
      return Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers,
        json() {
          return {
            data: null,
            errors: [{ message: 'Unauthorized' }],
          };
        },
      });
    }

    let body: any[] =
      opts.body instanceof FormData
        ? JSON.parse((opts.body as any).get('operations'))
        : JSON.parse(opts.body as string);
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
      headers,
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
