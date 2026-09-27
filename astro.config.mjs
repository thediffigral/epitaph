import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://thediffigral.github.io/epitaph/",
  base: "/epitaph/",
  integrations: [sitemap()]
});
