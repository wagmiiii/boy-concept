# Alpha Movies Booking and Showcase Site

A fast, dark-mode booking and showcase website for Boy Concept (Alpha Movies Ltd). It turns Instagram DM price-checks into structured, date-first enquiries, shows the work in a categorized portfolio, and gives corporate and diaspora clients verifiable proof of legitimacy.

Status and progress: [ROADMAP.md](ROADMAP.md). Start there.

## Stack

Astro 6 (static) served by one Cloudflare Worker (Hono) with D1 for enquiries, Resend for email and Turnstile for bot protection. Node 22 or newer. The workspaces exist in spike form from task S-1: no Tailwind, no Preact, no content collections and no real API yet. Task P-1 fills them in.

## Running what exists today

```
npm install
npm run build        # the Astro site into web/dist
npm run dev:worker   # wrangler dev: serves web/dist and routes /api/* to Hono
npm run typecheck
```

`npm test` and `npm run lint` do not exist yet: Vitest and ESLint arrive at P-1 and B-1. Never deploy to production; the test deploy comes with task P-20.

## Docs

| File | What it is |
|---|---|
| [ROADMAP.md](ROADMAP.md) | Tasks, gates, readiness score, progress log. Updated on every contribution |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Where every file lives and why |
| [docs/PRD.md](docs/PRD.md) | What we are building, for whom, and what it must do |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design, data models, decisions |
| [docs/ARCHITECTURE_ESSENTIALS.md](docs/ARCHITECTURE_ESSENTIALS.md) | Short outline of the critical decisions |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual design system: colors, type, components, logo rules |
| [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) | Instructions for coding agents |

## Working in this repo

1. Pick a task from `ROADMAP.md`. Branch as `task/<id>-short-slug`.
2. Commit messages start with the task ID, for example `P-12: confirmation screen`.
3. Open a PR into `main`. Fill in the template.
4. Every PR updates `ROADMAP.md`. A PR that adds, deletes or renames files also updates `PROJECT_STRUCTURE.md`. CI checks both.

## Rules that matter most

No budget field. Date first. The WhatsApp handoff is a visible button. Never invent content. No secrets or personal data in the repo. The full list is in `docs/ARCHITECTURE_ESSENTIALS.md`.

## Not in this repo

Secrets, real enquiry data and build output.

License: [decide with the client]. Treat the code as private until then.
