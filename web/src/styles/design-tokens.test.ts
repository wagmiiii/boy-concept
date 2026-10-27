import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const tokensPath = "web/src/styles/tokens.css";

function designTokenNames(): string[] {
  const design = readFileSync(join(repoRoot, "docs/DESIGN.md"), "utf8");
  const tokensSection = design.split("### Tokens")[1];
  if (!tokensSection) throw new Error("docs/DESIGN.md has no '### Tokens' section");
  const block = tokensSection.split("```css")[1];
  if (!block) throw new Error("The tokens section has no css code block");
  const declarationList = block.split("```")[0];
  if (!declarationList) throw new Error("The css code block is not closed");
  return [...declarationList.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]!);
}

function sourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(join(repoRoot, dir))) {
    const path = join(dir, entry);
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    if (statSync(join(repoRoot, path)).isDirectory()) sourceFiles(path, files);
    else if (/\.(ts|tsx|astro|css|mjs)$/.test(entry)) files.push(path);
  }
  return files;
}

describe("design tokens", () => {
  // DESIGN.md section 12: tokens.css is the only implementation of these values.
  it("declares every token named in docs/DESIGN.md", () => {
    const css = readFileSync(join(repoRoot, tokensPath), "utf8");
    const missing = designTokenNames().filter((name) => !css.includes(`${name}:`));
    expect(missing).toEqual([]);
  });

  it("keeps hex literals out of every other source file", () => {
    const offenders: string[] = [];
    for (const dir of ["web/src", "shared", "worker/src"]) {
      for (const file of sourceFiles(dir)) {
        if (file === tokensPath) continue;
        const hexes = [...readFileSync(join(repoRoot, file), "utf8").matchAll(/#[0-9a-fA-F]{3,8}\b/g)];
        if (hexes.length > 0) offenders.push(`${file}: ${hexes.map((m) => m[0]).join(" ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  // DESIGN.md section 5 gives the site three breakpoints, and global.css resets the Tailwind scale
  // to them. A 640 or 1280 variant therefore emits no CSS at all, which is a layout that differs
  // from the design in silence rather than in an error.
  it("keeps responsive variants to the documented breakpoints", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("web/src")) {
      const hits = [
        ...readFileSync(join(repoRoot, file), "utf8").matchAll(/(?:^|[^A-Za-z0-9-])(?:sm|xs|2xl):[a-z]/g),
      ];
      if (hits.length > 0) offenders.push(`${file}: ${hits.map((m) => m[0].trim()).join(" ")}`);
    }
    expect(offenders).toEqual([]);
  });
});
