# PROJECT_STRUCTURE

Where everything lives and why. Read this before creating, moving or deleting a file.

| | |
|---|---|
| Last updated | 2026-10-27 |
| Structure version | 0.8 |
| Status | Partly real. Files marked (exists) are on disk. Everything else is created when its ROADMAP task is started. Since P-1 the `web` workspace is a normal Astro 7 site with Tailwind v4, the Preact integration, the Fonts API, the design tokens and a base layout, and since P-2 it has the ten section components, the real page order, a 404 page and the assets `not_found_handling` that goes with it; `shared` is still an empty workspace until P-10 and P-11, and `worker` still holds only the spike routes. P-3 built the hero and P-4 wired the showreel, which is now the one component that ships JavaScript. P-25 moved the whole site onto DESIGN section 5's breakpoints and gutters and rebuilt the Process section as a rail. P-5 added the content layer: `web/src/content.config.ts` with the projects schema and the verification build guard in `content-rules.ts`, and four labelled demo entries under `web/src/content/projects/`. The Work grid reads that collection now, and no real project is in it |

## Update rule (mandatory, applies to humans and agents)

Update this file in the same change whenever you add, move, rename or delete a file or folder, or change what a file is for.

1. Edit the tree and the file table below.
2. Add a row to the Structure change log at the bottom.
3. Add a Progress log line in `ROADMAP.md` (that file is updated on every contribution, this one only when the structure changes).

CI enforces this: a PR that adds, deletes or renames any file must also change this file.

## Principles

1. One source of truth per fact. If a fact is written in two places, this file says which one wins.
2. Docs describe decisions. Code and content files hold behavior and content. Do not restate code in docs.
3. Anything unverified lives in `/content` or `/docs/research`, labeled as unverified, never in rendered content or site copy.
4. Do not create folders or files that are not in this file. If you need one, add it here first, and explain why.
5. Parked features have a design sketch in ARCHITECTURE.md section 12 and no code. Do not scaffold them.

## Conventions

| Thing | Convention |
|---|---|
| Living docs at the repo root | UPPERCASE.md (AGENTS.md, ROADMAP.md) |
| Design docs in `/docs` | UPPERCASE.md (PRD.md, ARCHITECTURE.md) |
| Other docs and notes | kebab-case.md |
| Astro components | PascalCase.astro. Preact islands PascalCase.tsx |
| Other source files | kebab-case.ts or short lowercase names (`phone.ts`) |
| Tests | `<name>.test.ts`, beside the file it covers (this is what `web/src` already does) or in the area's `test` folder |
| Task IDs | Defined in ROADMAP.md (F-1, P-12, B-10). Use them in commits and log lines |
| Branch names | `task/<id>-short-slug`, for example `task/P-12-confirmation-screen` |
| Commit messages | `<task id>: what changed`, for example `P-12: confirmation screen` |

## Tree

Markers: (exists) is a real file today. (P-12) and similar mean created by that ROADMAP task. (1) means Phase 1. (K) means only if Q13 is yes.

```
/
├── README.md                          (exists) what this is, how to start, links to the docs
├── AGENTS.md                          (exists) instructions for any coding agent
├── CLAUDE.md                          (exists) Claude Code additions, imports AGENTS.md
├── ROADMAP.md                         (exists) status, tasks, gates, progress log. Updated on every contribution
├── PROJECT_STRUCTURE.md               (exists) this file
├── .gitignore                         (exists)
├── .nvmrc                             (exists, S-1) Node 22
├── package.json                       (exists, S-1) npm workspaces web, worker, shared, root scripts, and the Node 22.22 floor from D22
├── package-lock.json                  (exists, S-1)
├── tsconfig.base.json                 (exists, S-1) shared strict TypeScript settings
├── eslint.config.js                   (exists, P-1) flat config, typescript-eslint recommended over .js, .ts and .tsx. .astro files are not linted, see P-22
├── vitest.config.ts                   (exists, P-1) one root config picking up tests in web, shared and worker. Node environment, no jsdom
│
├── .github/
│   ├── CODEOWNERS                     (exists) review ownership
│   ├── pull_request_template.md       (exists) checklist including the ROADMAP update
│   └── workflows/
│       └── ci.yml                     (exists) fails a PR that skips ROADMAP.md, or adds, deletes or renames files without PROJECT_STRUCTURE.md; (B-16) adds lint, typecheck, astro check, tests, build
│
├── docs/
│   ├── PRD.md                         (exists) what and for whom
│   ├── ARCHITECTURE.md                (exists) design, data models, decisions
│   ├── ARCHITECTURE_ESSENTIALS.md     (exists) short outline for agents
│   ├── DESIGN.md                      (exists) visual design system built from the supplied logo
│   ├── spikes/
│   │   └── stack-spike.md             (exists, S-1 in progress) results of the stack checks, S-4 completes it
│   └── research/                      inputs that are NOT verified
│       ├── boy-concept-brief.md       (exists) the original research brief, labeled unverified
│       └── reference-site-notes.md    (exists) notes on directorengineer.framer.media
│
├── pitch/
│   ├── Alpha_Movies_Proposal.pptx     (exists) Canva-editable proposal deck
│   └── pitch-script.md                (D-6) message and walkthrough script
│
├── assets/
│   └── brand/
│       ├── alpha-movies-logo-original.png (exists) supplied logo, 4000 x 2667, archive only, never loaded on the site
│       └── wordmark-flat.*, favicon.*, og-image.png   (P-21) small-size and social versions. The web-ready WebP moved to web/src/assets/brand at P-1
│
├── content/                           single place for words and proof (not rendered directly)
│   ├── copy.md                        (exists) all site copy, reviewed before it goes into the pages
│   ├── PLACEHOLDERS.md                (exists) register of every bracketed placeholder
│   └── verification-log.md            (exists) claim, source, date, who verified
│
├── web/                               (exists, S-1) Astro 7 site, static output
│   ├── package.json                   (exists, S-1) astro, @astrojs/preact and preact pinned exactly (D22)
│   ├── astro.config.mjs               (exists, S-1) static output, no adapter. P-1 added the Tailwind v4 vite plugin, the Preact integration and the two font families. P-4 added `vite.build.assetsInlineLimit: 0` so component scripts stay external files (D26)
│   ├── tsconfig.json                  (exists, S-1)
│   ├── dist/                          build output, gitignored, what the Worker assets binding serves
│   ├── public/                        (exists, S-3)
│   │   ├── _headers                   (exists, S-3) CSP and security headers. Verified to govern asset responses and asset redirects only, never /api/* (D21). P-1 dropped the Google Fonts origins because the Fonts API self-hosts
│   │   ├── media/                     (exists, P-4) video files, served as they are with no build step
│   │   │   └── demo-reel.mp4          (exists, P-4) 7 s, 1280 x 720, 50 kB, silent. The labelled stand-in the showreel plays until C-2 delivers footage
│   │   └── robots.txt                 (P-20) noindex on the test environment
│   └── src/
│       ├── assets/brand/              (exists, P-1) web-ready logo and poster images
│       │   └── alpha-movies-logo.webp (exists, P-1) 1600 x 760, moved here from assets/brand so Astro optimizes it
│       ├── assets/media/              (exists, P-4) stills that go through Astro's image pipeline
│       │   └── demo-reel-poster.webp  (exists, P-4) 1920 x 1080, 16 kB, the showreel poster. Build output picks 640 and 1280 widths from it
│       ├── styles/
│       │   ├── tokens.css             (exists, P-1) the only implementation of the DESIGN.md tokens, plus the section 8 motion values
│       │   ├── global.css             (exists, P-1) Tailwind v4 entry, the `@theme inline` map, the DESIGN breakpoint scale, base styles and the shared component classes including .container-site (P-2, P-25)
│       │   └── design-tokens.test.ts  (exists, P-1) checks tokens.css against DESIGN.md, bans hex literals elsewhere, and refuses responsive variants outside the design's three breakpoints (P-25)
│       ├── content.config.ts          (exists, P-5) the collections, wired to the schemas in content-rules.ts by a glob loader. Astro validates every entry here at sync and build, which is what makes a guard violation fail the build
│       ├── content-rules.ts           (exists, P-5) the projects schema, the bracket scan that backs the verification guard, and the two render predicates (verified and publish_ok, or explicitly a demo entry). Pure, and it imports no Astro virtual module so a test can run the guard without a build
│       ├── content-rules.test.ts      (exists, P-5) the guard cases: placeholder paths, a verified entry missing page fields, the flags a file can leave out, demo against verified or publish_ok, both render predicates, and that the four content files are placeholders covering every category
│       ├── content/
│       │   ├── projects/              (exists, P-5) one file per project. Today four demo entries, one per category, every unknown bracketed (D28). C-2 replaces them with verified, permitted work
│       │   │   └── demo-commercial.yaml, demo-cultural-festival.yaml, demo-wedding.yaml, demo-documentary.yaml (exists, P-5)
│       │   ├── credentials/           (P-8) one file per credential
│       │   └── settings.yaml          (P-10)
│       ├── layouts/
│       │   └── Base.astro             (exists, P-1) head, fonts, noindex and the body shell. Pages compose the nav and the footer; the shell stays free of them so the 404 page can omit the nav
│       ├── components/                (exists, P-2) the section shells, all .astro
│       │   ├── Nav.astro                (exists, P-2) sticky bar, text brand, desktop links, mobile details menu, Check a date
│       │   ├── Hero.astro               (exists, P-2) logo, headline, supporting line, both CTAs
│       │   ├── Showreel.astro           (exists, P-2) 16:9 poster, play button, and the tap that creates the player (P-4). The one component with a script
│       │   ├── PortfolioGrid.astro      (exists, P-2) category chips from the schema's own category list, inert until P-6, and the cards the collection returns: the demo entries today (P-5)
│       │   ├── ProjectCard.astro        (exists, P-2) 16:9 poster, category chip, H3 title
│       │   ├── Credentials.astro        (exists, P-2) DEMO cards showing the verified-only treatment
│       │   ├── Services.astro           (exists, P-2) four service cards with tag chips
│       │   ├── Process.astro            (exists, P-2) the five-step rail: 44 px numeral, divider per row, heading beside it from 1200 px (P-25)
│       │   ├── Faq.astro                (exists, P-2) four details and summary disclosures, works with JavaScript off
│       │   ├── Footer.astro             (exists, P-2) logo, social and contact placeholders, base city, copyright
│       │   └── EnquiryForm.tsx        (P-12) the only Preact island
│       └── pages/
│           ├── index.astro            (exists, P-2) the real section order plus the enquiry section shell and its field list
│           ├── 404.astro              (exists, P-2) the page `not_found_handling = "404-page"` serves, so a miss is HTML with status 404 (D19)
│           ├── projects/[slug].astro  (P-7)
│           └── privacy.astro          (L-4)
│
├── shared/                            (exists, S-1) pure code imported by web and worker. The package.json is here so the workspace resolves; the code lands at P-10 and P-11
│   ├── package.json                   (exists, S-1)
│   ├── whatsapp.ts                    (P-11) message and wa.me URL builders
│   ├── whatsapp.test.ts               (P-11)
│   └── site-config.ts                 (P-10) owner WhatsApp digits and site origin
│
├── worker/                            (exists, S-1) Cloudflare Worker: Hono API plus the static build as assets. Today it holds only the spike routes
│   ├── package.json                   (exists, S-1)
│   ├── tsconfig.json                  (exists, S-1)
│   ├── wrangler.toml                  (exists, S-1) assets directory ../web/dist, binding ASSETS, run_worker_first ["/api/*"], not_found_handling "404-page" (P-2, D19)
│   ├── vitest.config.ts               (B-1)
│   ├── .dev.vars.example              (B-2) names of variables, no values
│   ├── migrations/
│   │   └── 0001_init.sql              (B-7) enquiry table
│   ├── src/
│   │   ├── index.ts                   (exists, S-1) Hono app: spike routes and a catch-all scoped per D19 at B-1
│   │   ├── config.ts                  (B-2) typed env access
│   │   ├── schema.ts                  (B-3) Zod schema for POST /api/enquiries
│   │   ├── routes/
│   │   │   └── enquiries.ts           (B-10)
│   │   └── lib/
│   │       ├── db.ts                  (B-8) the only file that knows D1
│   │       ├── notify.ts              (B-9) Resend email
│   │       ├── phone.ts               (B-3) libphonenumber-js wrapper
│   │       ├── ref.ts                 (B-4) reference code generator
│   │       └── turnstile.ts           (B-5)
│   └── test/
│       ├── phone.test.ts              (B-3)
│       ├── ref.test.ts                (B-4)
│       └── schema.test.ts             (B-3)
│
├── cms/                               (K) Sanity studio and notes. Created only if Q13 is yes
│
└── ops/
    ├── launch-checklist.md            (R-6)
    ├── handover-checklist.md          (R-10)
    ├── owner-guide.md                 (R-2)
    ├── rollout-kit.md                 (R-1) bio link text, DM saved reply, staff script
    └── test-matrix.md                 (P-18, R-3) device and browser results
```

## File table

| Path | Purpose | Phase | Update when |
|---|---|---|---|
| README.md | Orientation for a new person or agent | exists | Setup or links change |
| AGENTS.md | Rules for coding agents | exists | A working rule changes or an agent breaks a rule |
| CLAUDE.md | Claude Code specifics | exists | Claude Code workflow changes |
| ROADMAP.md | Status and progress log | exists | Every contribution |
| PROJECT_STRUCTURE.md | This map | exists | A file or folder is added, moved, renamed, deleted or repurposed |
| .gitignore | Keeps secrets, dependencies and personal data out of git | exists | Something new must be ignored |
| .github/CODEOWNERS | Review ownership | exists | Reviewers change |
| .github/pull_request_template.md | PR checklist, including the living-docs updates | exists | The checklist or a hard rule changes |
| .github/workflows/ci.yml | Enforces ROADMAP and PROJECT_STRUCTURE updates, later lint, typecheck, tests and build | exists | A check is added or changed |
| package.json, package-lock.json | npm workspaces (web, worker, shared) and root scripts | exists (S-1) | A workspace or root script is added |
| tsconfig.base.json | The strict TypeScript settings every workspace extends | exists (S-1) | A strictness rule changes |
| .nvmrc | The Node version the project expects | exists (S-1) | The Node floor changes |
| web/astro.config.mjs | Static output, no SSR adapter, and later `site` | exists (S-1) | The build target changes |
| web/public/_headers | CSP and security headers for the asset layer | exists (S-3) | A script, frame or embed host is added or removed, at P-4 and P-12 |
| worker/wrangler.toml | The one Worker: assets binding, run_worker_first and not_found_handling | exists (S-1) | Routing, compatibility date or bindings change (D17, D19). P-2 added `not_found_handling = "404-page"` |
| worker/src/index.ts | Spike routes today; Hono route wiring at B-1 | exists (S-1) | A route is added |
| shared/package.json | Makes `shared` a resolvable workspace | exists (S-1) | The shared entry points are declared at P-10 |
| docs/PRD.md | Product requirements | exists | A requirement, scope item or open question changes |
| docs/ARCHITECTURE.md | Design and decision log | exists | A technical decision changes |
| docs/ARCHITECTURE_ESSENTIALS.md | Agent outline | exists | ARCHITECTURE.md changes a rule, endpoint or data name |
| docs/DESIGN.md | Colors, type, spacing, components, logo rules | exists | A visual rule changes, or the logo or brand is confirmed or replaced |
| assets/brand/* | Logo and brand files | exists | The logo is replaced or a brand file is added |
| docs/spikes/stack-spike.md | Results of the stack checks | exists (S-1) | Spike results change |
| docs/research/* | Unverified inputs, kept for reference | exists | Rarely. Never promote content from here without a verification-log entry |
| pitch/* | Material for the pitch | D | The pitch changes |
| content/copy.md | Source for all site text | exists | Copy changes. Edit here first, then update the pages |
| content/PLACEHOLDERS.md | Every `[bracketed]` placeholder: where it is, who owns it, status | exists | A placeholder is added or resolved |
| content/verification-log.md | Evidence for every shown credential or stat | exists | A fact is verified or withdrawn |
| web/src/styles/tokens.css | Design tokens, the only implementation | exists (P-1) | DESIGN.md changes a token. The test below fails if they drift |
| web/src/styles/global.css | Tailwind v4 entry, the `@theme inline` map to tokens.css, the DESIGN section 5 breakpoint reset, base styles and the shared component classes (.container-site, .btn-primary, .btn-secondary, .eyebrow, .chip, .card, .poster-frame, .demo-tag) | exists (P-1) | A DESIGN.md scale, base or component rule changes. Component classes use @apply because @theme inline values are not emitted as CSS variables. Never add a breakpoint outside md/lg/xl (D27) |
| web/src/styles/design-tokens.test.ts | Asserts tokens.css matches DESIGN.md section 3, that no other source file holds a hex literal, and that no `sm:`, `xs:` or `2xl:` variant appears in web/src | exists (P-1) | Either token rule changes, or the breakpoint scale in D27 changes |
| web/src/layouts/Base.astro | Head, fonts, noindex, body shell. No nav or footer: pages compose those, so the 404 page can drop the anchor nav | exists (P-1) | A page-level tag or the font loading changes |
| web/src/assets/brand/alpha-movies-logo.webp | The web logo Astro optimizes | exists (P-1) | The brand changes, see D-9 and P-21 |
| eslint.config.js | Flat eslint config over .js, .ts and .tsx | exists (P-1) | A lint rule changes. .astro coverage is P-22 |
| vitest.config.ts | One root test config for web, shared and worker | exists (P-1) | A workspace is added or a browser environment is needed |
| web/src/content.config.ts | The collections, wired to the schemas and the verification build guard | exists (P-5) | A collection is added or a loader changes |
| web/src/content-rules.ts | The projects schema, the bracket scan behind the guard, and the two render predicates | exists (P-5) | A content rule changes. Credentials get their own schema here at P-8 |
| web/src/content/** | Projects, credentials, settings | projects exist (P-5) | Content is verified, added or withdrawn |
| web/src/components/Nav.astro | Sticky bar: text brand, desktop links, mobile details menu, primary CTA | exists (P-2) | The nav spec in DESIGN.md section 7 changes, or Q12 settles the brand text |
| web/src/components/Hero.astro | Logo, headline, supporting line, both CTAs | exists (P-2) | P-3 replaces the bracketed copy. P-21 or Q12 changes the mark |
| web/src/components/Showreel.astro | 16:9 poster, play button, player created on tap, and the stand-in clip until C-2 | exists (P-2, wired P-4) | C-2 footage or a YouTube id replaces the stand-in. The id moves to `shared/site-config.ts` at P-10 |
| web/public/media/demo-reel.mp4 | The 7 s silent placeholder reel the showreel plays | exists (P-4) | Delete when C-2 delivers real footage (P-24) |
| web/src/assets/media/demo-reel-poster.webp | Showreel poster, labelled as placeholder artwork inside the image | exists (P-4) | Replaced with a real poster at C-2 |
| web/src/components/PortfolioGrid.astro | Category chips and the card grid | exists (P-2) | P-6 wires filtering and hides empty categories (FR-26) |
| web/src/components/ProjectCard.astro | Poster, category chip, H3 title, no link yet | exists (P-2) | P-6 gives it a real poster and P-7 a project page. The category and title come from the collection since P-5 |
| web/src/components/Credentials.astro | DEMO cards in the verified-only treatment | exists (P-2) | P-8 replaces it with the collection and the hide rule |
| web/src/components/Services.astro | Four service cards with tag chips | exists (P-2) | P-9 and C-10 put real names, tags and copy in |
| web/src/components/Process.astro | The five-step rail: a 44 px numeral, one divider per row, the heading in a left column from 1200 px | exists (P-2) | P-9 and C-10. Layout settled by the P-25 audit (DESIGN section 7) |
| web/src/components/Faq.astro | Four details disclosures | exists (P-2) | P-9 and C-10 |
| web/src/components/Footer.astro | Logo, contact rows, base city, copyright | exists (P-2) | P-10 supplies settings and the number, P-15 the direct link |
| web/src/pages/404.astro | The page served for an asset miss, with status 404 | exists (P-2) | DESIGN changes, or the assets 404 handling changes (D19) |
| web/src/pages/index.astro | Page order plus the enquiry section shell and its field list | exists (P-2) | A section is added, removed or reordered. P-12 replaces the shell with the island |
| web/src/components/EnquiryForm.tsx | Enquiry form island | P-12 | Form behavior changes |
| shared/whatsapp.ts | WhatsApp message and URL builders | P-11 | The message format changes |
| shared/site-config.ts | Owner WhatsApp digits and site origin | P-10 | The number or domain changes |
| worker/** | Enquiry API and static hosting | 1 | Per ARCHITECTURE.md |
| worker/migrations/* | D1 schema history | B-7 | The schema changes. Add a new file, never edit an applied one |
| cms/** | Sanity studio | K | Only if Q13 is yes |
| ops/* | Checklists, guides and test logs | R | Process or results change |

## Where does X live

| Thing | Source of truth | Also appears in |
|---|---|---|
| Task status | ROADMAP.md | nowhere else |
| Current phase | ROADMAP.md header | nowhere else |
| Site copy | content/copy.md | the pages in `web/src` (copied) |
| Projects and credentials | `web/src/content` | content/verification-log.md holds the evidence |
| Owner WhatsApp number | `shared/site-config.ts` | nowhere else. Web and worker import it |
| Colors, type, spacing | docs/DESIGN.md | `web/src/styles/tokens.css` is the only implementation |
| Logo and brand files | `assets/brand` (original) | `web/src/assets/brand` (web-ready, derived) |
| Hard rules | docs/ARCHITECTURE_ESSENTIALS.md | AGENTS.md lists the most-broken ones and points here |
| Decisions | docs/ARCHITECTURE.md decision log | ESSENTIALS where it is a rule |
| Secrets | Worker environment variables, `worker/.dev.vars` locally (gitignored) | nowhere else, ever |
| Enquiries | D1 | email to owner |
| Placeholders | content/PLACEHOLDERS.md | the places they appear |
| Open questions | ROADMAP.md tracker | PRD section 12 holds the original wording |

## Known duplication

- The web-ready logo in `web/src/assets/brand` is derived from `assets/brand/alpha-movies-logo-original.png`. Regenerate it if the original changes.
- Phone checks exist as light validation in the browser and as full parsing in the Worker. The Worker is authoritative.

Removed by the stack change: the Framer copy of the message builder and the Framer copy of the design tokens. Both now have a single source.

## Directory rules

- `/web` holds the site only. No secrets, no API code.
- `/shared` holds pure functions and one config file, with no imports from web or worker code.
- `/worker/src/lib/db.ts` is the only file allowed to know D1.
- `/content` is the only place where unverified claims may exist, and they must be bracketed. Rendered content in `web/src/content` must be verified, with one exception the schema enforces: an entry marked `demo: true` (D28) is a designed placeholder, holds nothing but brackets and a category, and can never carry `verified: true` or `publish_ok: true`. C-11 deletes them.
- `/assets` holds brand files only. The 2.4 MB original is an archive and is never loaded on the site. Site media that the build must optimize goes to `web/src/assets/<kind>`, and anything served untouched goes to `web/public/`.
- `/docs/research` is never read as fact by an agent.
- There is no setup script in this repo or outside it. F-6 was completed by hand on 2026-10-27. Do not write one.
- Do not commit: secrets, `.dev.vars`, `node_modules`, `dist`, `.astro`, `.wrangler`, personal data from real enquiries.

## Structure change log

Newest first.

| Date | Who | Change | Task |
|---|---|---|---|
| 2026-10-27 | Agent (Qoder) | P-5 created the content layer. Added `web/src/content.config.ts` (the projects collection, a glob loader over YAML entries, entry id = file name stem = the P-7 slug), `web/src/content-rules.ts` (the projects schema, `bracketedFieldsIn`, `shorableProjects`, `placeholderProjects`) and `web/src/content-rules.test.ts` (15 guard and render-rule cases). Added four files under `web/src/content/projects/`: `demo-commercial.yaml`, `demo-cultural-festival.yaml`, `demo-wedding.yaml`, `demo-documentary.yaml`, each marked `demo: true` with every unknown bracketed (D28). `PortfolioGrid.astro` now queries the collection and maps its chips over the schema's own category list instead of a copy, and `ProjectCard.astro`'s comment records that the poster arrives with the first shorable entry. Nothing moved or was deleted. The directory rule about unverified content was amended to name the `demo` flag, because four placeholder files are now in `web/src/content` and the old sentence said that could not happen | P-5, D28, ESSENTIALS 16 |
| 2026-10-27 | Agent (Qoder) | P-25 conformance pass. No file added, moved, renamed or deleted. `global.css` gained the DESIGN section 5 breakpoint reset (`--breakpoint-*: initial`, then md 768, lg 1200, xl 1440) and `.container-site`, which took the gutter rule away from ten components and added the 40 px desktop step the design always asked for. `design-tokens.test.ts` gained a third assertion: no `sm:`, `xs:` or `2xl:` in `web/src`, which is what keeps the reset from silently swallowing a mistyped variant. `Process.astro` was rewritten as a numbered rail, `Faq.astro` lost its decorative Q markers, `index.astro` lost the 1 to 13 field numbers and gained `md:self-start` on the submit, `Nav.astro` links read "Work" and carry 44 px targets, and every section container now uses `.container-site` | P-25, D27, ESSENTIALS 19, DESIGN 5, 7, 11, 12, 13 |
| 2026-10-27 | Agent (Qoder) | P-4 wired the showreel. Added `web/src/assets/media/demo-reel-poster.webp` (goes through Astro's image pipeline) and `web/public/media/demo-reel.mp4` (served as is, because a build step cannot optimize video), both rendered locally with ffmpeg and both labelled as placeholder artwork. `Showreel.astro` gained the poster, the play button, the tap handler and the youtube-nocookie branch, which made it the first component with client JavaScript, so `astro.config.mjs` now sets `vite.build.assetsInlineLimit: 0`: Astro 7 inlines a small component script into the page as an inline module, and the CSP `script-src 'self'` refuses to run it (D26). No file moved or was deleted | P-4, D26, P-24 (the clip is on its removal list) |
| 2026-10-27 | Agent (Qoder) | P-2 built the page skeleton. Added the ten section components under `web/src/components`, `web/src/pages/404.astro`, and rewrote `index.astro` as the PRD section order. `global.css` gained an `@layer components` block with the DESIGN section 7 shared classes, and `worker/wrangler.toml` gained `not_found_handling = "404-page"`, which is what 404.astro exists for (D19, re-probed in docs/spikes/stack-spike.md). No file moved or was deleted | P-2, P-24 (added), D23, D24 |
| 2026-10-27 | Agent (Qoder) | P-1 filled the scaffold in. Added `web/src/styles/tokens.css`, `global.css` and `design-tokens.test.ts`, `web/src/layouts/Base.astro`, root `eslint.config.js` and `vitest.config.ts`. Moved `assets/brand/alpha-movies-logo.webp` to `web/src/assets/brand/`, so `assets/brand` now holds only the archive original and the P-21 planned files. `web/src/pages/index.astro` stopped being a spike page and became the scaffold page P-2 replaces. Root `package.json` gained `lint` and `test` and the Node 22.22 floor | P-1, P-22, P-23 |
| 2026-10-27 | Agent (Qoder) | Added `web/public/_headers` early, for S-3, and marked `web/public/` as existing. The file is a real CSP plus security headers, verified to apply to the asset layer only (D21). B-11 still owns tightening it once Turnstile, GA4 and the embed host exist | S-3, B-11 |
| 2026-10-27 | Agent (Qoder) | Deleted the root `ARCHITECTURE.md`, a byte-identical copy of `docs/ARCHITECTURE.md`; docs/ is the single source. Added the real scaffold ahead of its tasks: root `package.json`, `package-lock.json`, `tsconfig.base.json`, `.nvmrc`, `web/` (Astro static config, tsconfig, spike `index.astro`), `worker/` (Hono spike `index.ts`, `wrangler.toml`, tsconfig), `shared/package.json` (new line: needed to make shared a workspace), `docs/spikes/stack-spike.md`. Planned `web/src/pages/404.astro` for P-2 (D19). Removed the false `repo-setup.sh` line from the directory rules | F-6, F-7, S-1, D19 |
| 2026-10-26 | Agent (Claude) | Stack changed from Framer to Astro, Worker and D1. Replaced `/framer` with `/web`, added `/shared/site-config.ts`, `worker/migrations`, conditional `/cms`. Removed the Framer spike file and the duplicated message builder and tokens | F-10 |
| 2026-10-10 | Agent (Claude) | Added docs/DESIGN.md and assets/brand (logo original and web version); planned flat wordmark, favicon and social image | F-9, P-21 |
| 2026-10-06 | Agent (Claude) | Created README, .gitignore, CODEOWNERS, PR template, CI workflow, content skeletons and research notes; marked them as existing | F-6, F-7, F-8 |
| 2026-10-06 | Agent (Claude) | Initial structure defined | F-5 |
