import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    tweet: z.string(),
    design: z.string(),
    cover: z.string()
  }),
});

export const collections = { pages: pages };
