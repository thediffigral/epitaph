import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://thediffigral.github.io/epitaph");
  return new Response(`User-agent: *
Allow: /
Sitemap: ${new URL("sitemap-index.xml", origin).href}
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
