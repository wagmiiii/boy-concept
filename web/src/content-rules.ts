// docs/ARCHITECTURE.md section 5: the content rules. The projects schema, the verification build
// guard and the render predicates live here rather than in content.config.ts because this module
// imports no Astro virtual modules, so a Vitest run can exercise the guard without a build.
// content.config.ts wires this schema to the loader, which is what makes a violation fail the build.
// The two video source helpers live in media-sources.ts: the reel's client script needs them, and
// importing this module into the page would ship zod to a visitor's phone.
import { z } from "astro/zod";
import { isSelfHostedVideo, youtubeEmbedUrl } from "./media-sources";

// FR-3. The chips in the grid come from this list, so a project cannot be filed under a category
// that the page does not offer.
export const projectCategories = ["Commercial", "Cultural Festivals", "Weddings", "Documentaries"];

const BRACKETED = /\[[^\]]*\]/;

/**
 * The field paths inside a value that still hold a `[bracketed]` placeholder.
 * @param value the parsed entry, walked as plain data
 * @param path the dot and bracket path built up by the recursion; empty at the root
 */
export function bracketedFieldsIn(value: unknown, path = ""): string[] {
  if (typeof value === "string") return BRACKETED.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => bracketedFieldsIn(item, `${path}[${index}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      bracketedFieldsIn(item, path === "" ? key : `${path}.${key}`),
    );
  }
  return [];
}

const incompleteVerifiedProject = (project: ProjectData): string[] => {
  const missing: string[] = [];
  // A verified entry renders on a project page (FR-4), so every field the page shows has to hold
  // something. The bracket guard above cannot catch a field that is simply absent.
  if (project.client_name === undefined && project.event_name === undefined) {
    missing.push("client_name or event_name");
  }
  if (project.year === undefined) missing.push("year");
  if (project.poster === undefined) missing.push("poster");
  if (project.deliverables.length === 0) missing.push("deliverables");
  if (isSelfHostedVideo(project.video_url)) return missing;
  // A verified entry has to actually play. An https URL that is not a YouTube link with an id is a
  // direct file on someone else's host, and the player here only knows how to embed YouTube.
  if (youtubeEmbedUrl(project.video_url) === undefined) {
    missing.push("video_url as a /media path or a YouTube link that carries a video id");
  }
  return missing;
};

export const projectSchema = z
  .object({
    title: z.string().min(1),
    category: z.enum(projectCategories),
    client_name: z.string().min(1).optional(),
    event_name: z.string().min(1).optional(),
    year: z.number().int().min(2015).max(2100).optional(),
    location: z.string().min(1).optional(),
    video_url: z.string().min(1),
    // A path under web/src/assets, resolved to an optimized image by poster-index.ts. It is a
    // string rather than an image reference so a content file stays plain data a CMS can write.
    poster: z.string().min(1).optional(),
    hero_reel: z.boolean().default(false),
    deliverables: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
    publish_ok: z.boolean().default(false),
    verified: z.boolean().default(false),
    // D28: a designed placeholder, not a project awaiting evidence. The schema keeps the two apart.
    demo: z.boolean().default(false),
    sort_order: z.number().int().min(0),
  })
  .superRefine((project, ctx) => {
    if (project.demo && (project.verified || project.publish_ok)) {
      ctx.addIssue({
        code: "custom",
        message:
          "a demo entry is a designed placeholder, so it cannot carry verified: true or publish_ok: true",
      });
    }
    if (!project.verified) return;

    const brackets = bracketedFieldsIn(project);
    if (brackets.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `verified: true while these fields still hold a bracketed placeholder: ${brackets.join(", ")}`,
      });
    }

    const missing = incompleteVerifiedProject(project);
    if (missing.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `verified: true while these are still missing: ${missing.join(", ")}`,
      });
    }
  });

export type ProjectData = z.infer<typeof projectSchema>;

interface ProjectLike {
  data: ProjectData;
}

/**
 * The stand-in a reel item wears in place of a title it does not have yet. A demo entry's own title
 * field holds `[project title]`, which is the wording D23 asks for in the grid, where a bracket
 * tells the builder the row is unfinished. The reel is the surface someone judges the quality of, so
 * P-27 gave it a label that reads as finished instead (D25). A shorable entry prints its own title
 * and nothing is substituted.
 */
export const placeholderReelTitle = "Placeholder reel";

/**
 * The title the showreel prints for a project. The grid keeps passing `data.title` until P-6.
 * @param project any collection entry
 */
export function reelTitle<T extends ProjectLike>(project: T): string {
  return project.data.demo ? placeholderReelTitle : project.data.title;
}

function inSortOrder<T extends ProjectLike>(projects: T[]): T[] {
  return [...projects].sort((a, b) => a.data.sort_order - b.data.sort_order);
}

/**
 * FR-3 and FR-27: a project shows only when the evidence is in and the client has permitted it.
 * @param projects the collection entries, in any order
 */
export function shorableProjects<T extends ProjectLike>(projects: T[]): T[] {
  return inSortOrder(projects.filter((project) => project.data.verified && project.data.publish_ok));
}

/**
 * D23: while nothing is shorable the section keeps its shape using entries explicitly marked as
 * placeholders. Entries that are simply unverified stay invisible, which is what keeps a private
 * wedding from showing up in the pitch demo.
 * @param projects the collection entries, in any order
 */
export function placeholderProjects<T extends ProjectLike>(projects: T[]): T[] {
  return inSortOrder(projects.filter((project) => project.data.demo));
}

/**
 * What a section renders: shorable projects when any exist, otherwise the designed placeholders.
 * Both the grid and the reel go through this, so neither can invent its own fallback rule (D23).
 * @param projects the collection entries, in any order
 */
export function visibleProjects<T extends ProjectLike>(projects: T[]): T[] {
  const shorable = shorableProjects(projects);
  return shorable.length > 0 ? shorable : placeholderProjects(projects);
}

/**
 * FR-2: the carousel is the visible projects flagged `hero_reel`. Going through visibleProjects is
 * what keeps a wedding that has no permission out of the reel, because it is not visible at all.
 * @param projects the collection entries, in any order
 */
export function reelItems<T extends ProjectLike>(projects: T[]): T[] {
  return visibleProjects(projects).filter((project) => project.data.hero_reel);
}
