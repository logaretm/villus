export default `
  type Post {
    id: ID!
    title: String!
    slug: String!
    isLiked: Boolean!
  }

  type Query {
    posts: [Post]!
  }

  type LikePostMutationResponse {
    success: Boolean!
    code: String!
    message: String!
    post: Post
  }

  type Mutation {
    likePost (id: ID!): LikePostMutationResponse!
  }
`;
