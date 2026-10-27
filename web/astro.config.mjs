import { defineConfig } from "astro/config";

// Static output only. No SSR adapter: the Worker serves the build as assets (ARCHITECTURE D13, D17).
export default defineConfig({
  output: "static",
});
