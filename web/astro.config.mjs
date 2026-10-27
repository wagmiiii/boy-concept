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
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Marcellus",
      cssVariable: "--font-marcellus",
      styles: ["normal"],
      fallbacks: ["Optima", "Candara", "Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 600],
      styles: ["normal"],
      fallbacks: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
    },
  ],
});
