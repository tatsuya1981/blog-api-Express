export const POST_STATUS = {
  DRAFT: 0,
  PUBLISHED: 100,
  PRIVATE: 200,
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];
