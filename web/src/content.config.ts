// Collection schemas (docs/ARCHITECTURE.md section 5). The schemas and the verification build
// guard live in content-rules.ts so a test can run them without a build; this file is the wiring
// that makes Astro apply them at sync and build time.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { credentialSchema, projectSchema } from "./content-rules";

// The entry id is the file name stem, less the extension, and that is the project slug the P-7
// project pages route on.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects" }),
  schema: projectSchema,
});

// P-8: Credentials collection
const credentials = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/credentials" }),
  schema: credentialSchema,
});

export const collections = { projects, credentials };
