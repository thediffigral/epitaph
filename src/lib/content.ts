import posts from "../../data/posts.json";

export type Post = {
  id: string;
  title: string;
  content: string;
  url: string;
  path?: string;
  published: string;
  updated: string;
  labels: string[];
  author: string;
  excerpt: string;
};

const englishLabel = (label: string) =>
  label
    .replace(/[\u0980-\u09FF]+/g, " ")
    .replace(/^[\s|–—: /()[\]{}-]+|[\s|–—: /()[\]{}-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

export const allPosts = (posts as Post[])
  .filter((post) => post.id && post.title)
  .map((post) => ({
    ...post,
    labels: [...new Set(post.labels.map(englishLabel).filter(Boolean))]
  }))
  .sort((a, b) => +new Date(b.published) - +new Date(a.published));

export const getPostImage = (post: Post) => {
  const match = post.content.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  return match?.[1] ?? "";
};

export const getPost = (id: string) => allPosts.find((post) => post.id === id);

export const getRelated = (current: Post) =>
  allPosts
    .filter((post) => post.id !== current.id && post.labels.some((x) => current.labels.includes(x)))
    .slice(0, 3);

export const getPostPath = (post: Post) => "post/" + encodeURIComponent(post.id);

export const getBloggerPath = (post: Post) => {
  if (post.path) return post.path.replace(/^\/+/, "").replace(/\/$/, "");
  try {
    return new URL(post.url).pathname.replace(/^\/+/, "").replace(/\/$/, "");
  } catch {
    return "";
  }
};
