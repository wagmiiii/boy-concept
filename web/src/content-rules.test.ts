import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  bracketedFieldsIn,
  placeholderProjects,
  projectSchema,
  shorableProjects,
  type ProjectData,
} from "./content-rules";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const projectsDir = "web/src/content/projects";

function entry(data: unknown): { data: ProjectData } {
  return { data: projectSchema.parse(data) };
}

function messagesFor(data: unknown): string {
  const result = projectSchema.safeParse(data);
  return result.success ? "" : result.error.issues.map((issue) => issue.message).join(" ");
}

const demoDraft = {
  title: "[project title]",
  category: "Commercial",
  video_url: "[video url]",
  summary: "[summary written at C-10]",
  publish_ok: false,
  verified: false,
  demo: true,
  sort_order: 10,
};

// Fixture values, never rendered. They stand in for the fields C-2 has to fill with real,
// permitted work.
const realProject = {
  title: "Launch reel for a fixture brand",
  category: "Commercial",
  client_name: "Fixture Client",
  year: 2026,
  location: "Lagos",
  video_url: "https://example.invalid/fixture",
  poster: "media/demo-reel-poster.webp",
  hero_reel: true,
  deliverables: ["highlight reel"],
  summary: "One sentence about the fixture shoot.",
  publish_ok: true,
  verified: true,
  demo: false,
  sort_order: 20,
};

describe("the bracket scan", () => {
  it("names every field path that still holds a bracketed placeholder", () => {
    expect(
      bracketedFieldsIn({
        title: "[project title]",
        client_name: "Real Client",
        deliverables: ["full film", "[deliverable]"],
        nested: { summary: "clean" },
        year: 2026,
        hero_reel: false,
      }),
    ).toEqual(["title", "deliverables[1]"]);
  });

  it("comes back empty for clean values", () => {
    expect(bracketedFieldsIn({ title: "A film", deliverables: ["full film"] })).toEqual([]);
    expect(bracketedFieldsIn(null)).toEqual([]);
  });
});

describe("the verification build guard", () => {
  it("accepts a complete verified project", () => {
    expect(messagesFor(realProject)).toBe("");
  });

  it("refuses a verified project that still holds a placeholder", () => {
    expect(messagesFor({ ...realProject, title: "[project title]" })).toContain("title");
    expect(messagesFor({ ...realProject, deliverables: ["[deliverable]"] })).toContain("deliverables[0]");
    expect(messagesFor({ ...realProject, summary: "[summary]" })).toContain("summary");
  });

  it("refuses a verified project missing a field the project page needs", () => {
    const issues = messagesFor({
      ...realProject,
      client_name: undefined,
      year: undefined,
      poster: undefined,
      deliverables: [],
      video_url: "not-a-url-yet",
    });
    for (const field of [
      "client_name or event_name",
      "year",
      "poster",
      "deliverables",
      "video_url as an https URL",
    ]) {
      expect(issues).toContain(field);
    }
  });

  it("leaves an unverified project alone", () => {
    expect(
      messagesFor({
        ...realProject,
        verified: false,
        client_name: undefined,
        year: undefined,
        poster: undefined,
        deliverables: [],
        video_url: "not-a-url-yet",
      }),
    ).toBe("");
  });

  it("applies the flags a content file can leave out", () => {
    expect(
      projectSchema.parse({
        title: "[project title]",
        category: "Weddings",
        video_url: "[video url]",
        summary: "[summary]",
        sort_order: 30,
      }),
    ).toMatchObject({ hero_reel: false, deliverables: [], publish_ok: false, verified: false, demo: false });
  });
});

describe("the demo flag", () => {
  it("accepts a placeholder that claims nothing", () => {
    expect(messagesFor(demoDraft)).toBe("");
  });

  it("refuses a demo entry marked verified or permitted", () => {
    expect(messagesFor({ ...demoDraft, verified: true })).toContain("designed placeholder");
    expect(messagesFor({ ...demoDraft, publish_ok: true })).toContain("designed placeholder");
  });

  it("refuses a real project still flagged as a demo", () => {
    expect(messagesFor({ ...realProject, demo: true })).toContain("designed placeholder");
  });
});

describe("the render rules", () => {
  const shorable = entry({ ...realProject, sort_order: 30 });
  const placeholder = entry({ ...demoDraft, sort_order: 10 });
  // Verified is not enough, and permission without evidence is not enough either (FR-27).
  const unpermitted = entry({ ...realProject, publish_ok: false, sort_order: 20 });
  const unverified = entry({ ...realProject, verified: false, sort_order: 25 });
  // Real work that is neither verified nor a designed placeholder: a private wedding. It has to
  // appear in neither list, which is what keeps it out of the pitch demo.
  const heldBack = entry({ ...realProject, verified: false, publish_ok: false, sort_order: 5 });
  const all = [shorable, placeholder, unpermitted, unverified, heldBack];

  it("shows only what is verified and permitted, in sort order", () => {
    expect(shorableProjects(all)).toEqual([shorable]);
  });

  it("falls back to the designed placeholders and never to held-back work", () => {
    expect(placeholderProjects(all)).toEqual([placeholder]);
  });

  it("puts the placeholder list aside once real projects exist", () => {
    const withRealContent = [entry({ ...realProject, sort_order: 15 }), placeholder];
    expect(shorableProjects(withRealContent)).toHaveLength(1);
    expect(shorableProjects([placeholder])).toEqual([]);
  });
});

describe("the demo content files", () => {
  it("are all placeholders while C-2 has delivered nothing", () => {
    const files = readdirSync(join(repoRoot, projectsDir)).filter((name) => name.endsWith(".yaml"));
    expect(files).toHaveLength(4);
    for (const name of files) {
      const text = readFileSync(join(repoRoot, projectsDir, name), "utf8");
      expect(text).toContain("demo: true");
      expect(text).toContain("verified: false");
      expect(text).toContain("publish_ok: false");
    }
  });

  it("covers every category the grid offers a chip for", () => {
    const categories = readdirSync(join(repoRoot, projectsDir))
      .filter((name) => name.endsWith(".yaml"))
      .map((name) => /^category: (.+)$/m.exec(readFileSync(join(repoRoot, projectsDir, name), "utf8"))?.[1]);
    expect([...categories].sort()).toEqual(
      ["Commercial", "Cultural Festivals", "Documentaries", "Weddings"],
    );
  });
});
