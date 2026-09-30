import fs from "node:fs/promises";

const blogUrl = "https://prankrishnab.blogspot.com/";
const apiKey = process.env.BLOGGER_API_KEY;

if (!apiKey) {
  console.log("BLOGGER_API_KEY is not set; keeping existing data/posts.json");
  process.exit(0);
}

const api = "https://www.googleapis.com/blogger/v3";
const lookupParams = new URLSearchParams({ key: apiKey, url: blogUrl });
const lookupRes = await fetch(api + "/blogs/byurl?" + lookupParams);

if (!lookupRes.ok) {
  throw new Error("Blogger blog lookup failed: " + lookupRes.status + " " + await lookupRes.text());
}

const blog = await lookupRes.json();
const blogId = blog.id;

if (!blogId) throw new Error("Blogger API did not return a blog ID.");

const base = api + "/blogs/" + blogId + "/posts";
const params = new URLSearchParams({
  key: apiKey,
  fetchBodies: "true",
  maxResults: "100",
  status: "LIVE"
});

const items = [];
let pageToken = "";

do {
  const pageParams = new URLSearchParams(params);
  if (pageToken) pageParams.set("pageToken", pageToken);

  const res = await fetch(base + "?" + pageParams);
  if (!res.ok) throw new Error("Blogger API failed: " + res.status + " " + await res.text());

  const json = await res.json();
  items.push(...(json.items ?? []));
  pageToken = json.nextPageToken ?? "";
} while (pageToken);

const strip = (html) =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const excerpt = (html) => {
  const text = strip(html);
  return text.slice(0, 180) + (text.length > 180 ? "…" : "");
};

const getSlug = (url, id) => {
  try {
    const pathname = new URL(url).pathname.replace(/\/+$/, "");
    const last = pathname.split("/").filter(Boolean).pop() ?? "";
    const slug = decodeURIComponent(last).replace(/\.html?$/i, "").trim();
    return slug || id;
  } catch {
    return id;
  }
};

const usedSlugs = new Map();
const uniqueSlug = (slug) => {
  const count = usedSlugs.get(slug) ?? 0;
  usedSlugs.set(slug, count + 1);
  return count === 0 ? slug : slug + "-" + (count + 1);
};

const posts = items.map((p) => ({
  id: p.id,
  slug: uniqueSlug(getSlug(p.url ?? "", p.id)),
  title: p.title ?? "Untitled",
  content: p.content ?? "",
  url: p.url ?? "",
  published: p.published ?? p.updated,
  updated: p.updated ?? p.published,
  labels: p.labels ?? [],
  author: p.author?.displayName ?? "Prankrishna Borgohain",
  excerpt: excerpt(p.content ?? "")
}));

await fs.writeFile("data/posts.json", JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log("Synced " + posts.length + " Blogger posts from " + blogUrl);
