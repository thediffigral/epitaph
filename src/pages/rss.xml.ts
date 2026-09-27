import type { APIRoute } from "astro";
import { allPosts, getPostPath } from "../lib/content";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
}[char]!));

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://thediffigral.github.io/epitaph");
  const items = allPosts.slice(0, 50).map((post) => {
    const link = new URL(getPostPath(post) + "/", origin).href;
    return `<item><title>${escapeXml(post.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${new Date(post.published).toUTCString()}</pubDate><description>${escapeXml(post.excerpt)}</description><author>Prankrishna Borgohain</author></item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>এপিটাফ — Epitaph</title><link>${origin.href}</link><description>Writings by Prankrishna Borgohain</description><language>as</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
