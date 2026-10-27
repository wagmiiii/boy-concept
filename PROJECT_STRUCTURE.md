# PROJECT_STRUCTURE

Where everything lives and why. Read this before creating, moving or deleting a file.

| | |
|---|---|
| Last updated | 2026-10-27 |
| Structure version | 0.5 |
| Status | Partly real. Files marked (exists) are on disk. Everything else is created when its ROADMAP task is started. `web`, `worker` and `shared` arrived early via S-1 and are spike-minimal: no Tailwind, no Preact, no content collections, no API beyond the spike routes |

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
| Tests | `<name>.test.ts`, in the area's `test` folder or beside the file in `shared` |
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
├── package.json                       (exists, S-1) npm workspaces web, worker, shared and root scripts
├── package-lock.json                  (exists, S-1)
├── tsconfig.base.json                 (exists, S-1) shared strict TypeScript settings
├── eslint.config.js                   (P-1)
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
│       ├── alpha-movies-logo.webp         (exists) trimmed web version, 1600 x 760. Moves to web/src/assets/brand at P-1
│       └── wordmark-flat.*, favicon.*, og-image.png   (P-21) small-size and social versions
│
├── content/                           single place for words and proof (not rendered directly)
│   ├── copy.md                        (exists) all site copy, reviewed before it goes into the pages
│   ├── PLACEHOLDERS.md                (exists) register of every bracketed placeholder
│   └── verification-log.md            (exists) claim, source, date, who verified
│
├── web/                               (exists, S-1) Astro 6 site, static output
│   ├── package.json                   (exists, S-1)
│   ├── astro.config.mjs               (exists, S-1) static output, no adapter
│   ├── tsconfig.json                  (exists, S-1)
│   ├── dist/                          build output, gitignored, what the Worker assets binding serves
│   ├── public/
│   │   ├── _headers                   (B-11) security headers and CSP
│   │   └── robots.txt                 (P-20) noindex on the test environment
│   └── src/
│       ├── assets/brand/              (P-1) web-ready logo and poster images
│       ├── styles/
│       │   ├── tokens.css             (P-1) the only implementation of the DESIGN.md tokens
│       │   └── global.css             (P-1) Tailwind v4 entry and base styles
│       ├── content.config.ts          (P-5) collection schemas and the verification build guard
│       ├── content/
│       │   ├── projects/              (P-5) one file per project
│       │   ├── credentials/           (P-8) one file per credential
│       │   └── settings.yaml          (P-10)
│       ├── layouts/
│       │   └── Base.astro             (P-2)
│       ├── components/                (P-2 onward) Nav, Hero, Showreel, PortfolioGrid, ProjectCard, Credentials, Services, Process, Faq, Footer (.astro)
│       │   └── EnquiryForm.tsx        (P-12) the only Preact island
│       └── pages/
│           ├── index.astro            (exists, S-1) spike page only, replaced by the real layout at P-2
│           ├── 404.astro              (P-2) so the assets `not_found_handling` has a page to serve (D19)
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
│   ├── wrangler.toml                  (exists, S-1) assets directory ../web/dist, binding ASSETS, run_worker_first ["/api/*"]
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
| worker/wrangler.toml | The one Worker: assets binding plus run_worker_first | exists (S-1) | Routing, compatibility date or bindings change (D17, D19) |
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
| web/src/styles/tokens.css | Design tokens | P-1 | DESIGN.md changes a token |
| web/src/content.config.ts | Content schemas and the build guard | P-5 | A content rule changes |
| web/src/content/** | Projects, credentials, settings | P-5 | Content is verified, added or withdrawn |
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
- `/content` is the only place where unverified claims may exist, and they must be bracketed. Rendered content in `web/src/content` must be verified.
- `/assets` holds brand files only. The 2.4 MB original is an archive and is never loaded on the site.
- `/docs/research` is never read as fact by an agent.
- There is no setup script in this repo or outside it. F-6 was completed by hand on 2026-10-27. Do not write one.
- Do not commit: secrets, `.dev.vars`, `node_modules`, `dist`, `.astro`, `.wrangler`, personal data from real enquiries.

## Structure change log

Newest first.

| Date | Who | Change | Task |
|---|---|---|---|
| 2026-10-27 | Agent (Qoder) | Deleted the root `ARCHITECTURE.md`, a byte-identical copy of `docs/ARCHITECTURE.md`; docs/ is the single source. Added the real scaffold ahead of its tasks: root `package.json`, `package-lock.json`, `tsconfig.base.json`, `.nvmrc`, `web/` (Astro static config, tsconfig, spike `index.astro`), `worker/` (Hono spike `index.ts`, `wrangler.toml`, tsconfig), `shared/package.json` (new line: needed to make shared a workspace), `docs/spikes/stack-spike.md`. Planned `web/src/pages/404.astro` for P-2 (D19). Removed the false `repo-setup.sh` line from the directory rules | F-6, F-7, S-1, D19 |
| 2026-10-26 | Agent (Claude) | Stack changed from Framer to Astro, Worker and D1. Replaced `/framer` with `/web`, added `/shared/site-config.ts`, `worker/migrations`, conditional `/cms`. Removed the Framer spike file and the duplicated message builder and tokens | F-10 |
| 2026-10-10 | Agent (Claude) | Added docs/DESIGN.md and assets/brand (logo original and web version); planned flat wordmark, favicon and social image | F-9, P-21 |
| 2026-10-06 | Agent (Claude) | Created README, .gitignore, CODEOWNERS, PR template, CI workflow, content skeletons and research notes; marked them as existing | F-6, F-7, F-8 |
| 2026-10-06 | Agent (Claude) | Initial structure defined | F-5 |
