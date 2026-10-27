import tseslint from "typescript-eslint";

// Only .js/.ts/.tsx are lintable here; .astro files need a parser nobody has installed yet.
// astro check covers their types.
export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.astro/**", "**/.wrangler/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
