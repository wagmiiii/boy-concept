// Collection schemas (docs/ARCHITECTURE.md section 5). The schemas and the verification build
// guard live in content-rules.ts so a test can run them without a build; this file is the wiring
// that makes Astro apply them at sync and build time. A project that fails the guard fails the
// build, so nothing unverified can reach a deploy.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectSchema } from "./content-rules";

// The entry id is the file name stem, less the extension, and that is the project slug the P-7
// project pages route on. It is deliberately not a field: a file whose slug disagreed with its
// name would be a second source of truth.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects" }),
  schema: projectSchema,
});

export const collections = { projects };
