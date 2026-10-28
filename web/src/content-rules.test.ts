import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  bracketedFieldsIn,
  placeholderProjects,
  placeholderReelTitle,
  projectSchema,
  reelItems,
  reelTitle,
  shorableProjects,
  visibleProjects,
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
// permitted work. The id is eleven characters because that is what a YouTube id is; the link
// itself points at nothing.
const realProject = {
  title: "Launch reel for a fixture brand",
  category: "Commercial",
  client_name: "Fixture Client",
  year: 2026,
  location: "Lagos",
  video_url: "https://www.youtube.com/watch?v=FIXTUREvid1",
  poster: "media/demo-reel-1-poster.webp",
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
      "video_url as a /media path",
    ]) {
      expect(issues).toContain(field);
    }
  });

  it("refuses a verified project whose video cannot be played", () => {
    // An https URL with no YouTube id is a file on someone else's host. The reel embeds YouTube or
    // plays a file we serve; it does not hotlink a third-party clip.
    expect(messagesFor({ ...realProject, video_url: "https://example.invalid/clip.mp4" })).toContain(
      "video_url as a /media path",
    );
    expect(messagesFor({ ...realProject, video_url: "/media/demo-reel-1.mp4" })).toBe("");
    expect(messagesFor({ ...realProject, video_url: "https://youtu.be/FIXTUREvid1" })).toBe("");
  });

  it("accepts a verified project whose video is a file we serve", () => {
    expect(messagesFor({ ...realProject, video_url: "/media/demo-reel-2.mp4" })).toBe("");
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

  it("names the stand-in the reel prints for a title that does not exist yet", () => {
    // D23 keeps the bracket in the content file and in the grid. D25 asks the reel, the surface
    // someone judges the quality of, to wear a finished-looking label instead.
    expect(reelTitle(entry(demoDraft))).toBe(placeholderReelTitle);
    expect(reelTitle(entry(realProject))).toBe(realProject.title);
    // The stand-in claims nothing: no bracket, no client, no superlative, no count.
    expect(placeholderReelTitle).not.toMatch(/\[[^\]]*\]/);
    expect(placeholderReelTitle).toBe("Placeholder reel");
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

describe("what the reel and the grid render", () => {
  const reelPlaceholder = entry({ ...demoDraft, hero_reel: true, sort_order: 10 });
  const gridOnlyPlaceholder = entry({ ...demoDraft, hero_reel: false, sort_order: 20 });
  const heldBackWedding = entry({
    ...realProject,
    category: "Weddings",
    hero_reel: true,
    verified: false,
    publish_ok: false,
    sort_order: 1,
  });

  it("shows the placeholders while nothing is shorable and the real work once it is", () => {
    expect(visibleProjects([reelPlaceholder, gridOnlyPlaceholder, heldBackWedding])).toEqual([
      reelPlaceholder,
      gridOnlyPlaceholder,
    ]);
    const shorable = entry({ ...realProject, sort_order: 5 });
    expect(visibleProjects([shorable, reelPlaceholder])).toEqual([shorable]);
  });

  it("takes the carousel from the visible projects and never from held-back work", () => {
    expect(reelItems([reelPlaceholder, gridOnlyPlaceholder, heldBackWedding])).toEqual([reelPlaceholder]);
    expect(reelItems([reelPlaceholder, gridOnlyPlaceholder])).toHaveLength(1);
  });

  it("comes back empty when no project is flagged for the reel", () => {
    expect(reelItems([gridOnlyPlaceholder, heldBackWedding])).toEqual([]);
  });
});

describe("the demo content files", () => {
  const projectTexts = () =>
    readdirSync(join(repoRoot, projectsDir))
      .filter((name) => name.endsWith(".yaml"))
      .map((name) => readFileSync(join(repoRoot, projectsDir, name), "utf8"));

  it("are all placeholders while C-2 has delivered nothing", () => {
    const texts = projectTexts();
    expect(texts).toHaveLength(4);
    for (const text of texts) {
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

  it("names media files that exist on disk", () => {
    // A poster path is a string relative to web/src/assets, resolved by poster-index.ts at build
    // time, and a video_url is served straight out of public/. Neither fails the build when the
    // file is absent: the card loses its image or the clip 404s on tap. This is the check.
    for (const text of projectTexts()) {
      const poster = /^poster: (.+)$/m.exec(text)?.[1];
      if (poster !== undefined) {
        expect(existsSync(join(repoRoot, "web/src/assets", poster)), poster).toBe(true);
      }
      const video = /^video_url: (\/media\/.+)$/m.exec(text)?.[1];
      if (video !== undefined) {
        expect(existsSync(join(repoRoot, "web/public", video)), video).toBe(true);
      }
    }
  });

  it("puts every clip that plays in the reel under a placeholder label", () => {
    // Every /media source has to have a poster saying it is a stand-in, and the Weddings entry,
    // which is the private category, stays out of the reel entirely (D23, D29).
    const texts = projectTexts();
    expect(texts.filter((text) => /^video_url: \/media\//m.test(text))).toHaveLength(3);
    for (const text of texts) {
      if (/^category: Weddings$/m.test(text)) {
        expect(text).toContain("hero_reel: false");
        expect(text).not.toMatch(/^poster: /m);
      } else {
        expect(text).toContain("hero_reel: true");
        expect(text).toMatch(/^poster: /m);
      }
    }
  });
});
