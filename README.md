# Epitaph

Modern Material-inspired front end for the Blogger site **এপিটাফ · Epitaph**.

## Content workflow

Write and publish in Blogger. GitHub Actions syncs the published posts into `data/posts.json` and rebuilds the Astro site.

## GitHub configuration

Add these repository secrets:

- `BLOGGER_API_KEY`
- `BLOGGER_BLOG_ID`

Then enable GitHub Pages with **Source: GitHub Actions**.

## Local development

```bash
npm install
npm run dev
```

Without Blogger credentials, the site builds with an empty archive until `data/posts.json` is populated.
