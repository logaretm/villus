import { graphql } from 'msw';

function makePost(id: number, title = 'Awesome Post') {
  return { id, title: `${id} ${title}` };
}

export const handlers = [
  // Handles a "GetUserInfo" query
  graphql.query('Posts', (req, res, ctx) => {
    return res(
      ctx.data({
        posts: new Array(5).fill(0).map((_, idx) => makePost(idx + 1)),
      })
    );
  }),
  graphql.query('Post', (req, res, ctx) => {
    return res(
      ctx.data({
        post: makePost(req.variables.id),
      })
    );
  }),
  graphql.query('QueryParseError', (req, res, ctx) => {
    return res(res => {
      res.headers.set('content-type', 'text/html');
      res.body = '<div></div>';

      return res;
    });
  }),
  graphql.query('QueryNetworkError', (req, res, ctx) => {
    return res.networkError('Failed to connect');
  }),
  graphql.query('QueryError', (req, res, ctx) => {
    return res(
      ctx.errors([
        {
          message: 'Not authenticated',
          errorType: 'AuthenticationError',
        },
      ])
    );
  }),
  graphql.query('ErrorWith500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.errors([
        {
          message: 'Not authenticated',
          errorType: 'AuthenticationError',
        },
      ])
    );
  }),
  graphql.mutation('LikePost', (req, res, ctx) => {
    return res(ctx.data({ likePost: makePost(req.variables.id || 1) }));
  }),
  graphql.mutation('MutationError', (req, res, ctx) => {
    return res(
      ctx.errors([
        {
          message: 'Not authenticated',
          errorType: 'AuthenticationError',
        },
      ])
    );
  }),
  graphql.query('MutationParseError', (req, res, ctx) => {
    return res(res => {
      res.headers.set('content-type', 'text/html');
      res.body = '<div></div>';

      return res;
    });
  }),
  graphql.mutation('MutationNetworkError', (req, res, ctx) => {
    return res.networkError('Failed to connect');
  }),
];
