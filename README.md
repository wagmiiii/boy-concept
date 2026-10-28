# Alpha Movies Booking and Showcase Site

A fast, dark-mode booking and showcase website for Boy Concept (Alpha Movies Ltd). It turns Instagram DM price-checks into structured, date-first enquiries, shows the work in a categorized portfolio, and gives corporate and diaspora clients verifiable proof of legitimacy.

Status and progress: [ROADMAP.md](ROADMAP.md). Start there.

## Stack

Astro 7 (static, pinned 7.4.1) served by one Cloudflare Worker (Hono) with D1 for enquiries, Resend for email and Turnstile for bot protection. Node 22.22 or newer. Since task P-1 the `web` workspace is a real Astro site: Tailwind v4 on the DESIGN.md tokens, Marcellus and Inter through the Astro Fonts API, a base layout and the optimized logo. Since P-2 it is also the real page skeleton: nav, hero, showreel, portfolio, credentials, services, process, FAQ, an enquiry shell, footer and a 404 page. Every one of those sections is placeholder copy or a DEMO block until the content is verified, so the site is not shareable with clients yet. `shared` is still empty until P-10 and P-11, and `worker` holds only the spike routes until Phase 1 clears gate G0.

## Running what exists today

```
npm install
npm run dev            # the Astro site
npm run dev:worker     # wrangler dev: serves web/dist and routes /api/* to Hono
npm run build          # the Astro site into web/dist
npm run lint
npm test
npm run typecheck
npm run deploy:test    # builds, then deploys the spike Worker to workers.dev
```

`npm run deploy:test` is the only deploy target and it points at the throwaway spike Worker. Do not run it unless you mean to publish, and there is no production deploy command.

There is exactly one deploy pipeline: this command. The Cloudflare dashboard also held a GitHub build integration left over from account onboarding, and it failed on every push and PR. Removing it took two steps and only the second worked: the hello-world Worker it was keyed to is deleted, and because a Workers Builds project survives the Worker under it, the check was silenced by uninstalling the Cloudflare Workers and Pages GitHub App on 2026-10-28 (L-6). Any future pipeline here starts by reinstalling that app, with its deploy command set to `npm run deploy:test`.

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
