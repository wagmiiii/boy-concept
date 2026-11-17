import { defineConfig, fontProviders } from "astro/config";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";

// Static output only. No SSR adapter: the Worker serves the build as assets (ARCHITECTURE D13, D17).
// Preact is wired for the one island that arrives at P-12; nothing is hydrated yet.
export default defineConfig({
  output: "static",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
  // Two families. Inter carries the interface and the tight display headings; Instrument Serif
  // italic is the single accent voice in a heading. Marcellus is retired with the redesign.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      fallbacks: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Instrument Serif",
      cssVariable: "--font-instrument",
      weights: [400],
      styles: ["normal", "italic"],
      fallbacks: ["Georgia", "Times New Roman", "serif"],
    },
  ],
});
