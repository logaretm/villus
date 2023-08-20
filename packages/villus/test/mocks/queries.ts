export const PostsQuery = `query Posts { posts { id title } }`;

export const PostsQueryWithDescription = `query Posts { posts { id title description } }`;

export const PostQuery = `query Post ($id: Int) { post (id: $id) { id title } }`;

export const PostQueryWithDescription = `query Post ($id: Int) { post (id: $id) { id title description } }`;

export const QueryWithGqlError = `query QueryError { posts { id title } }`;

export const QueryWithParseError = `query QueryParseError { posts { id title } }`;

export const QueryWithNetworkError = `query QueryNetworkError { posts { id title } }`;

export const QueryErrorWith500 = `query ErrorWith500 { posts { id title } }`;

export const LikePostMutation = `mutation LikePost ($id: Int!) { likePost (id: $id) { id title } }`;

export const MutationWithNetworkError = `mutation MutationNetworkError ($id: Int!) { likePost (id: $id) { id title } }`;

export const MutationWithGqlError = `mutation MutationError ($id: Int!) { likePost (id: $id) { id title } }`;

export const MutationWithParseError = `mutation MutationParseError ($id: Int!) { likePost (id: $id) { id title } }`;
