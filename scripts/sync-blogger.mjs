import fs from "node:fs/promises";

const blogId = process.env.BLOGGER_BLOG_ID || "blogger-blog-id";
const apiKey = process.env.BLOGGER_API_KEY;

if (!apiKey) {
  console.log("BLOGGER_API_KEY is not set; keeping existing data/posts.json");
  process.exit(0);
}

const base = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`;
const params = new URLSearchParams({
  key: apiKey,
  fetchBodies: "true",
  maxResults: "100",
  status: "LIVE"
});

const res = await fetch(`${base}?${params}`);
if (!res.ok) throw new Error(`Blogger API failed: ${res.status} ${await res.text()}`);
const json = await res.json();

const strip = (html) => html.replace(/<script[\\s\\S]*?<\\/script>/gi, "").replace(/<style[\\s\\S]*?<\\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
const excerpt = (html) => strip(html).slice(0, 180) + (strip(html).length > 180 ? "…" : "");

const posts = (json.items ?? []).map((p) => ({
  id: p.id,
  title: p.title ?? "Untitled",
  content: p.content ?? "",
  url: p.url ?? "",
  published: p.published ?? p.updated,
  updated: p.updated ?? p.published,
  labels: p.labels ?? [],
  author: p.author?.displayName ?? "Prankrishna Borgohain",
  excerpt: excerpt(p.content ?? "")
}));

await fs.writeFile("data/posts.json", JSON.stringify(posts, null, 2) + "\\n", "utf8");
console.log(`Synced ${posts.length} Blogger posts.`);