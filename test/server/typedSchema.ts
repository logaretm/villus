export interface Post {
  id: number;
  title: string;
  slug: string;
  isLiked: boolean;
}

export interface LikePostMutationResponse {
  success: boolean;
  code: string;
  message: string;
  post: Post;
}
