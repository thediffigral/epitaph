import posts from "../../data/posts.json";

export type Post = {
  id: string;
  title: string;
  content: string;
  url: string;
  published: string;
  updated: string;
  labels: string[];
  author: string;
  excerpt: string;
};

export const allPosts = (posts as Post[]).sort((a,b) => +new Date(b.published) - +new Date(a.published));
export const getPost = (id: string) => allPosts.find((post) => post.id === id);
export const getRelated = (current: Post) =>
  allPosts.filter((post) => post.id !== current.id && post.labels.some((x) => current.labels.includes(x))).slice(0, 3);
