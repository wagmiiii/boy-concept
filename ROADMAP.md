# ROADMAP

Single source of truth for project status and for the path to 100% readiness.

| | |
|---|---|
| Last updated | 2026-10-27 |
| Stack | Astro 6 (static, pinned 6.4.8 for the spike, see D20), one Cloudflare Worker (Hono) and D1. Changed from Framer on 2026-10-26 (decision D13) |
| Current phase | Discovery (D) and the stack spike (S). S-1 and S-5 are done; S-2, S-3 and S-4 remain, and S-2 needs real devices |
| Readiness | 16% (13 of 83 Must tasks done) |
| Gates passed | none. G1: the single-Worker routing is verified locally and on the edge; S-2 and S-3 still decide the gate |
| CMS decision | Pending Q13. Section K (hosted CMS) is excluded from the score until Q13 is yes |

## Update rule (mandatory, applies to humans and agents)

Every contribution updates this file before it counts as done. A contribution is any change to code, content, docs, config or process.

1. Set the status of every task you touched. Add tasks you discovered, with a size, an owner and dependencies.
2. Recalculate the scorecard and the Readiness line above.
3. Add one line to the Progress log: date, who, what, task IDs, files. One line per PR or work session is enough.
4. If you added, moved, renamed or deleted a file or folder, update `PROJECT_STRUCTURE.md` as well.
5. Say in your final report that you updated this file. CI fails a PR that does not touch it, and fails a PR that adds, deletes or renames files without touching `PROJECT_STRUCTURE.md` (task F-7).

Status symbols: `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked (say why in Blockers), `[-]` not applicable (say why in the log).

Owner values: Ademola, Agent (a coding agent), Emmanuel (the client). Sizes are guesses: S is under half a day, M is about a day, L is several days [Guessing].

## Definition of 100% readiness

The project is 100% ready when every Must task in sections F, D, S, P, C, L, B and R is `[x]`, and gates G0 to G4 have passed. Should tasks are tracked but do not block 100%. Section K (hosted CMS) joins the Must count only if Q13 is yes. Section X happens after launch and is not counted.

Score = Must tasks done divided by Must tasks in the counted sections. If Q13 is yes, the K tasks are added to the denominator and the score drops. That is correct.

## Scorecard

Recalculate on every update.

| Section | Must done | Should done | Conditional |
|---|---|---|---|
| F Foundations | 10 of 10 | 0 of 0 | n/a |
| D Discovery and pitch | 1 of 8 | 1 of 1 | n/a |
| S Stack spike | 2 of 5 | 0 of 0 | n/a |
| P Phase 0 | 0 of 19 | 0 of 2 | n/a |
| C Phase 1 | 0 of 11 | 0 of 0 | n/a |
| K Hosted CMS (conditional) | n/a | n/a | 0 of 4 |
| L Phase 1 | 0 of 4 | 0 of 2 | n/a |
| B Phase 1 | 0 of 16 | 0 of 0 | n/a |
| R Phase 1 | 0 of 10 | 0 of 0 | n/a |
| X Post-launch | not counted | not counted | n/a |
| **Total counted** | **13 of 83** | **1 of 5** | |

## Gates

| Gate | Condition | Decided by tasks | Status |
|---|---|---|---|
| G0 | Emmanuel agrees to proceed and answers Q1 | D-7, D-8 | open |
| G1 | Stack spike passed: one Worker serves the build and /api/*, and Turnstile and the WhatsApp button work in the Instagram in-app browser. If routing fails, use two Workers with CORS. If the in-app browser fails, redesign the form flow | S-4 | open. Routing half verified locally and on the edge 2026-10-27; S-2, S-3 open |
| G2 | Content bar met: minimum verified, permitted content is in the site | C-9, C-11 | open |
| G3 | Launch checklist signed off by Emmanuel | R-6 | open |
| G4 | Handover accepted: every account is in the client's name | R-10 | open |

## Critical path and schedule risks

- The longest delays are the client-dependent C tasks, mainly C-2, C-3 and C-5. Start asking at D-5, not after the demo is built [Likely].
- G1 can change the design. Run the S tasks early, because Turnstile and the WhatsApp button inside the Instagram in-app browser block the form flow.
- Phase 1 cannot start before G0. If Emmanuel declines or already has a site (Q1), re-scope the whole roadmap.
- A hand-built front end is slower to a polished first demo than a visual editor was [Likely]. P-1 to P-4 are the early risk, and DESIGN.md exists to shorten them.
- Verified content is the credibility layer, which is the strongest part of the pitch. A thin content set is a schedule risk and a product risk.
- Nothing here has dates. Add dates only after G0, once Emmanuel's response time is known.
- Deploys now have two competing pipelines. The Cloudflare dashboard holds a GitHub build integration for this repo that fails at the deploy step, and a green run of it would publish main without anyone choosing to. L-6 settles it, and must be decided before P-20. The spike Worker lives on a throwaway builder account; the client-owned accounts are still L-1.
- The GitHub repo is public and already holds the supplied logo and the proposal deck. If the pitch is sensitive before D-7, make it private. Nothing secrets-bearing is in it (Certain, checked .gitignore and tree).

## Tasks

Priority: M is Must, S is Should, C is conditional. Refs point to requirement IDs (FR-n), PRD sections, ARCHITECTURE sections or ESSENTIALS rules.

### F. Foundations: docs, repo and process

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [x] | F-1 | PRD written and stress-tested | Agent | S | none | PRD | M |
| [x] | F-2 | ARCHITECTURE written and stress-tested | Agent | S | none | ARCH | M |
| [x] | F-3 | ARCHITECTURE_ESSENTIALS | Agent | S | F-2 | ESSENTIALS | M |
| [x] | F-4 | AGENTS.md and CLAUDE.md | Agent | S | F-3 | none | M |
| [x] | F-5 | ROADMAP.md and PROJECT_STRUCTURE.md written; contribution protocol added to every instruction file and doc | Agent | M | F-4 | none | M |
| [x] | F-6 | Create the repo, scaffold folders per PROJECT_STRUCTURE.md, move docs into /docs, add README.md and .gitignore. Done 2026-10-27: wagmiiii/boy-concept exists on GitHub with main in sync, the duplicate root ARCHITECTURE.md is deleted, the workspaces are real. There was never a repo-setup.sh; that claim is dropped | Ademola, Agent | S | F-5 | none | M |
| [x] | F-7 | Add PR template and CI that fails a PR not touching ROADMAP.md, or adding, deleting or renaming files without PROJECT_STRUCTURE.md. Done 2026-10-27: PR #1 ran the roadmap-and-structure check and it passed, and this very status flip is the second commit that had to touch ROADMAP.md to be allowed | Ademola, Agent | S | F-6 | none | M |
| [x] | F-8 | Create skeletons for content/PLACEHOLDERS.md, content/verification-log.md and content/copy.md | Agent | S | F-6 | none | M |
| [x] | F-9 | DESIGN.md written from the supplied logo; logo added under assets/brand | Agent | M | F-5 | docs/DESIGN.md | M |
| [x] | F-10 | Stack changed from Framer to Astro, Worker and D1; every doc updated to match (decision D13) | Agent | M | F-9 | ARCH 3, D13 | M |

### D. Discovery and pitch

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | D-1 | Verify public facts about Boy Concept: RC on CAC search, registered name, IG and YouTube figures | Ademola | S | none | PRD Q3, Q4 | M |
| [x] | D-2 | Pitch proposal deck generated (Canva-editable .pptx) | Agent | S | none | none | M |
| [ ] | D-3 | Fill the proposal placeholders, import into Canva, review | Ademola | S | D-1, D-2 | none | M |
| [x] | D-4 | Reference site review (directorengineer.framer.media) | Agent | S | none | none | S |
| [ ] | D-5 | Ask Emmanuel Q1, Q2 and Q6: existing site, starting price, enquiry volume | Ademola | S | none | PRD Q1, Q2, Q6 | M |
| [ ] | D-6 | Write the pitch message and walkthrough script, calling out the date-first form | Ademola | S | D-3 | none | M |
| [ ] | D-7 | Send the pitch with the preview link and walkthrough | Ademola | S | D-6, P-20 | none | M |
| [ ] | D-8 | Record Emmanuel's answers to the open questions in this file | Ademola | S | D-7 | PRD section 12 | M |
| [ ] | D-9 | Ask Emmanuel Q11, Q12 and Q13: is the supplied logo official and is there a vector or flat version, which name leads publicly, will he edit content himself | Ademola | S | none | PRD Q11, Q12, Q13 | M |

### S. Stack spike

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [x] | S-1 | Confirm one Worker serves the Astro static build as assets and routes /api/* to a Hono app, locally and deployed to test. Done 2026-10-27: checks A1 to A10 pass in wrangler dev and against the deployed boy-concept-spike Worker. Evidence and the two side effects (D19) in docs/spikes/stack-spike.md | Agent, Ademola | S | F-6 | ARCH Verify 1 | M |
| [ ] | S-2 | Confirm Turnstile and a form submit work in the Instagram in-app browser (iOS and Android) and the wa.me button opens WhatsApp | Ademola | M | S-1 | ARCH Verify 2 | M |
| [ ] | S-3 | Check D1, Workers and Resend free-tier limits against expected volume; check that _headers and the CSP work with Worker assets | Ademola, Agent | S | S-1 | ARCH Verify 3, 4, 5 | M |
| [~] | S-4 | Write docs/spikes/stack-spike.md; update the Verify list; decide gate G1. The file holds S-1 and S-5; finish it when S-2 and S-3 are in, then decide G1 | Agent | S | S-1, S-2, S-3, S-5 | none | M |
| [x] | S-5 | Deploy the spike Worker to a throwaway test workers.dev address (noindex) and repeat checks A1 to A9 from the spike doc. Done 2026-10-27 at boy-concept-spike.ademola2993k.workers.dev. Found the root-of-workspace wrangler failure, fixed by the deploy:test root script. The subdomain registered as ademola2993k, not the agreed boy-concept | Ademola, Agent | S | S-1 | ARCH Verify 1, G1 | M |

### P. Phase 0: Astro pitch demo (no backend)

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | P-1 | Scaffold workspaces: web (Astro 6, TypeScript, Tailwind v4, Preact), shared, root scripts, Node 22. tokens.css from docs/DESIGN.md, fonts, base layout. Move the web logo into web/src/assets/brand. The workspaces and root scripts already exist from S-1 and are spike-minimal: this task fills them in, adds eslint.config.js and vitest, and settles the Astro 6 advisory against Node per D20 | Agent | M | F-6, F-9 | DESIGN.md, ARCH 3 | M |
| [ ] | P-2 | Page skeleton and section order: nav, hero, showreel, portfolio, credentials, services, process, FAQ, form, footer. Add 404.astro so the assets `not_found_handling` has a page to serve (D19) | Agent | S | P-1 | none | M |
| [ ] | P-3 | Hero with both CTAs | Agent | S | P-2 | FR-1 | M |
| [ ] | P-4 | Showreel: poster first, video created on tap | Agent | S | P-2 | FR-2 | M |
| [ ] | P-5 | Content collections and schemas: projects with verified and publish_ok, the verification build guard; demo items marked as placeholders | Agent | M | P-2 | FR-3, FR-27, ARCH 5 | M |
| [ ] | P-6 | Portfolio grid, category filter, hide empty categories | Agent | M | P-5 | FR-3, FR-26 | M |
| [ ] | P-7 | Project page template | Agent | S | P-5 | FR-4 | M |
| [ ] | P-8 | Credentials collection and section with the hide rule | Agent | M | P-5 | FR-6, FR-7, FR-26 | M |
| [ ] | P-9 | Services, process and FAQ in the pages, from content/copy.md | Agent | S | F-8, P-2 | FR-19 | S |
| [ ] | P-10 | settings.yaml, shared/site-config.ts (owner WhatsApp digits, site origin) and the footer | Agent | S | P-2 | FR-20, ARCH D16 | M |
| [ ] | P-11 | shared/whatsapp.ts: message builder and wa.me URL builder, digits only, with unit tests | Agent | S | P-1 | FR-12, ESSENTIALS rule 4 | M |
| [ ] | P-12 | EnquiryForm island: fields per PRD section 7, native validation, clientRequestId, local message build, confirmation screen with visible button and copy fallback | Agent | L | P-11 | FR-8, FR-11, FR-12, FR-13 | M |
| [ ] | P-13 | Form rules: date window and short-notice flag, second date, country-aware phone input, WhatsApp-or-email rule, reference-video escape | Agent | M | P-12 | PRD 7 | M |
| [ ] | P-14 | From-price line and response-time copy bound to settings | Agent | S | P-10, P-12 | FR-10, FR-15 | M |
| [ ] | P-15 | Direct WhatsApp link that works without JavaScript | Agent | S | P-10 | FR-24 | M |
| [ ] | P-16 | GA4 events: form_submit and whatsapp_tap | Agent | S | P-12 | FR-21 | S |
| [ ] | P-17 | Mobile pass: LCP on throttled 4G, contrast and keyboard checks, JavaScript budget, no autoplay iframes | Ademola | M | P-3 to P-15 | PRD 9, DESIGN 11 | M |
| [ ] | P-18 | Handoff test matrix: iOS Safari, Android Chrome, Instagram in-app on both; log in ops/test-matrix.md | Ademola | M | P-12, S-2 | ARCH 11 | M |
| [ ] | P-19 | Placeholder register complete; every demo placeholder is bracketed | Agent | S | P-5, P-8 | PRD 8 | M |
| [ ] | P-20 | Deploy the static site to the test Worker on a noindex workers.dev address | Ademola | S | P-17, P-18, P-19, S-1 | none | M |
| [ ] | P-21 | Flat one-color wordmark, favicon mark and a 1200 x 630 social image for small sizes, tabs and link previews | Ademola, Agent | M | F-9, D-9 | DESIGN 2, 13 | M |

### G. Gates

See the Gates table above. Update it when a gate is decided.

### C. Phase 1: content and verification (client-dependent)

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | C-1 | Brand assets: confirm the supplied logo, get a vector or flat version, confirm colors and fonts | Emmanuel | M | G0 | PRD Q10, Q11 | M |
| [ ] | C-2 | Video links or source files and poster images for the agreed minimum | Emmanuel | L | G0 | PRD Q7 | M |
| [ ] | C-3 | Per-project client permission and music clearance check | Emmanuel | M | C-2 | PRD Q8, FR-27 | M |
| [ ] | C-4 | Verified registration details, RC checked on CAC | Ademola, Emmanuel | S | D-1 | PRD Q3 | M |
| [ ] | C-5 | Equipment list, collaborations and press, each with a source | Emmanuel | M | G0 | PRD Q3, Q4 | M |
| [ ] | C-6 | Verified stats with sources, or a decision to show none | Emmanuel | S | C-5 | FR-7 | M |
| [ ] | C-7 | Starting price and a response-time promise someone will keep | Emmanuel | S | G0 | PRD Q2, Q5 | M |
| [ ] | C-8 | WhatsApp number, who monitors it, who reads the email | Emmanuel | S | G0 | PRD Q5 | M |
| [ ] | C-9 | Agree the minimum content bar (projects per category, credentials count) | Ademola, Emmanuel | S | C-2, C-5 | FR-26 | M |
| [ ] | C-10 | Final site copy written from his answers into content/copy.md and approved | Agent, Emmanuel | M | C-7 | none | M |
| [ ] | C-11 | Enter content into the content files (or Sanity if Q13 is yes) with verified and publish_ok set; clear every placeholder; the build guard passes | Agent | M | C-1 to C-10 | PRD 8, ARCH 5 | M |

### K. Phase 1: hosted CMS (conditional on Q13 being yes)

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | K-1 | Sanity project and schemas mirroring the content collections | Agent | M | Q13 | ARCH 12 | C |
| [ ] | K-2 | Build-time fetch from Sanity into the Astro collections, keeping the verification guard | Agent | M | K-1 | ARCH 5 | C |
| [ ] | K-3 | Webhook that triggers a rebuild and deploy on publish | Agent, Ademola | S | K-2 | none | C |
| [ ] | K-4 | Owner training and a content guide in ops/owner-guide.md | Ademola | S | K-3 | none | C |

### L. Phase 1: platform

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | L-1 | Accounts in the client's name: domain, Cloudflare, GitHub, Resend, GA4 | Ademola, Emmanuel | M | G0 | ARCH 10 | M |
| [ ] | L-2 | Connect the custom domain to the prod Worker, SSL, www redirect | Ademola | S | L-1 | none | M |
| [ ] | L-3 | Titles, meta, OG image, favicon; check link previews in WhatsApp and Instagram | Ademola | S | C-1, P-21 | none | M |
| [ ] | L-4 | Privacy notice page and consent text; check NDPA 2023 duties | Ademola | M | none | ARCH Verify 8 | M |
| [ ] | L-5 | GA4 on the production domain; confirm both events fire | Ademola | S | L-2, P-16 | FR-21 | S |
| [ ] | L-6 | Settle who owns deploys: the Cloudflare dashboard has a GitHub build integration for this repo whose deploy command is `npx wrangler deploy`, which fails from a workspace root. Change it to `npm run deploy:test` or disconnect it, so exactly one pipeline publishes. Decided before P-20 | Ademola | S | S-5 | ARCH 10 | S |

### B. Phase 1: backend (Worker and D1)

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | B-1 | Scaffold /worker: Hono, Zod, Wrangler, Vitest, strict tsconfig, assets binding pointing at ../web/dist, run-first for /api/* | Agent | S | G0, G1 | ARCH 3 | M |
| [ ] | B-2 | config.ts typed env access and worker/.dev.vars.example | Agent | S | B-1 | none | M |
| [ ] | B-3 | schema.ts, phone.ts (libphonenumber-js) and unit tests | Agent | M | B-1 | PRD 7 | M |
| [ ] | B-4 | ref.ts and unit tests | Agent | S | B-1 | none | M |
| [ ] | B-5 | turnstile.ts, honeypot and origin check | Agent | S | B-1 | FR-14 | M |
| [ ] | B-6 | Per-contact rate limit as a D1 count; optional IP backstop | Agent | S | B-7 | ARCH 8 | M |
| [ ] | B-7 | D1 test and prod databases and migrations/0001_init.sql with the UNIQUE and CHECK constraints | Agent, Ademola | S | L-1 | ARCH 5 | M |
| [ ] | B-8 | db.ts: idempotent insert on client_request_id, lookup, rate-limit count | Agent | M | B-7, B-2 | FR-28 | M |
| [ ] | B-9 | notify.ts via Resend to OWNER_EMAILS | Agent | S | B-2 | FR-18 | M |
| [ ] | B-10 | routes/enquiries.ts with dedupe and every failure row in ARCH 7 | Agent | L | B-3 to B-9 | FR-12, FR-28 | M |
| [ ] | B-11 | Security headers and CSP in web/public/_headers; confirm they apply to Worker assets | Agent | S | B-10, S-3 | ARCH 8 | M |
| [ ] | B-12 | Wire the EnquiryForm island to the API with the three fallbacks: Turnstile twice, 429, API down | Agent | M | B-10 | ARCH 7 | M |
| [ ] | B-13 | Deploy to test and exercise every failure row end to end | Ademola, Agent | M | B-12 | none | M |
| [ ] | B-14 | Resend domain verification (SPF, DKIM) and a Gmail inbox placement test | Ademola | S | L-1 | ARCH Verify 4 | M |
| [ ] | B-15 | Prod deploy on the custom domain, secrets set, smoke test | Ademola | S | B-13, B-14, L-2 | none | M |
| [ ] | B-16 | CI: lint, typecheck, astro check, unit tests and the web build on every PR | Agent | S | P-1, F-7 | ARCH 11 | M |

### R. Phase 1: rollout and launch

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | R-1 | Rollout kit written: bio link, DM saved reply, highlight, staff script | Agent | S | C-7 | FR-25 | M |
| [ ] | R-2 | Owner guide: how content is updated, how enquiries arrive, deleting data on request | Agent | M | C-11 | ARCH 10 | M |
| [ ] | R-3 | Pre-launch test matrix passes on production | Ademola | M | C-11, L-2, B-15 | ARCH 11 | M |
| [ ] | R-4 | Content gate: the build passes, nothing unverified or unpermitted is visible, no placeholders, empty sections hide | Ademola | S | C-11 | FR-26, FR-27 | M |
| [ ] | R-5 | Performance and accessibility checks on production | Ademola | S | C-11 | PRD 9 | M |
| [ ] | R-6 | Launch checklist reviewed with Emmanuel and signed off (gate G3) | Ademola, Emmanuel | S | R-1 to R-5 | none | M |
| [ ] | R-7 | Go live on the production domain | Ademola | S | R-6 | none | M |
| [ ] | R-8 | Post-launch smoke test: a real submission end to end, with the correct WhatsApp message and both emails | Ademola | S | R-7 | none | M |
| [ ] | R-9 | Owner updates the Instagram bio link, saved reply and highlight | Emmanuel | S | R-7 | FR-25 | M |
| [ ] | R-10 | Handover checklist: accounts, secret rotation, D1 migration and deletion commands, content update steps (gate G4) | Ademola, Emmanuel | M | R-8 | ARCH 10 | M |

### X. Post-launch (not counted in readiness)

| Status | ID | Task | Owner | Size | Depends on | Refs | P |
|---|---|---|---|---|---|---|---|
| [ ] | X-1 | 30-day review: metrics against PRD targets, decide form field cuts | Ademola | M | R-9 | PRD 4, 7 | S |
| [ ] | X-2 | Remove the builder from OWNER_EMAILS if deliverability is clean | Ademola | S | X-1 | ARCH 10 | S |
| [ ] | X-3 | Review the parked-feature triggers | Ademola | S | X-1 | PRD 5 | S |
| [ ] | X-4 | Phase 2 deposit, only if the owner asks | Ademola | L | X-1 | FR-22, FR-23 | S |

## Open questions tracker

Fill the Answer column as soon as Emmanuel responds, then update the PRD if an answer changes scope.

| # | Question | Status | Answer |
|---|---|---|---|
| Q1 | Does he already have a website or booking link? | open | |
| Q2 | Starting price for event coverage | open | |
| Q3 | Verified RC number, base city, equipment list | open | |
| Q4 | Verifiable view counts and client names | open | |
| Q5 | Which WhatsApp number receives briefs, who watches it, who reads the email | open | |
| Q6 | Roughly how many enquiries per week, and what share are price checks | open | |
| Q7 | Do his best videos exist as source files, or only on Instagram | open | |
| Q8 | Which clients allow public showing, and are tracks cleared for YouTube | open | |
| Q9 | Will he and his team change the Instagram bio and DM replies | open | |
| Q10 | Domain ownership, brand colors, and who holds each service account | open | |
| Q11 | Is the supplied logo the current official one, and is there a vector or flat version | open | |
| Q12 | Which name leads publicly, Alpha Movies or Boy Concept | open | |
| Q13 | Will Emmanuel edit site content himself, or will the builder? Yes means a hosted CMS (section K) | open | |

## Blockers

No open blockers. The S-5 blocker, a missing workers.dev subdomain, cleared the same day it appeared. Add a row when a task is marked `[!]`.

| Task | Blocked by | Since | Next action |
|---|---|---|---|

## Progress log

Newest first. One line per PR or work session.

| Date | Who | What | Tasks | Files |
|---|---|---|---|---|
| 2026-10-27 | Agent (Qoder) | Closed S-5 and S-1. Ademola registered the workers.dev subdomain through the Workers and Pages onboarding, which chose `ademola2993k` rather than the agreed `boy-concept`. His dashboard build then failed for a genuine repo reason: `npx wrangler deploy` refuses to run in an npm workspace root. Added the deploy:test root script AGENTS.md always promised, verified with a dry run, deployed boy-concept-spike, and reran the whole check matrix against the live URL: A1 to A10 match the local results, so D17 holds on Cloudflare's edge and the two-Worker fallback stays unused. Bundle 826 KiB raw, 134 KiB gzipped, startup 14 ms, which feeds S-3. Recorded that the dashboard GitHub integration now competes with the GitHub Action and added L-6 to settle who owns deploys | S-1, S-5, S-4, L-6 (added) | package.json, ROADMAP.md, docs/spikes/stack-spike.md, docs/ARCHITECTURE.md, docs/ARCHITECTURE_ESSENTIALS.md |
| 2026-10-27 | Agent (Qoder) | Attempted the deployed half of the spike (S-5) with an Account API token supplied by Ademola. whoami passed and the site built, but wrangler refuses to publish or run a remote preview because the account has no workers.dev subdomain, and the API rejects creating one with an Account token (10405). Nothing was published and nothing in the account changed. Recorded the whole attempt, the agreed subdomain name boy-concept, and the token rotation note in the spike doc. Marked S-5 blocked with a Blockers row and flagged that P-20 and B-15 inherit the same prerequisite | S-5 (blocked), S-1, S-4 | docs/spikes/stack-spike.md, ROADMAP.md |
| 2026-10-27 | Agent (Qoder) | Closed the foundations gaps honestly and ran the local half of the stack spike. Deleted the duplicate root ARCHITECTURE.md (byte-identical to docs/). Scaffolded the real workspaces: root package.json with web/worker/shared, tsconfig.base.json, .nvmrc, an Astro 6 static site, and one Worker whose `[assets] run_worker_first = ["/api/*"]` serves the build and routes the API. Ran the server, 9 checks, and `npm run build` plus `npm run typecheck` (0 errors). S-1 local half passes; asset misses fall through to the Worker, which is now decision D19. Added D20 for the Astro 6 critical advisory against the Node floor. The repo exists on GitHub with main in sync, so F-6 is done and the false repo-setup.sh claim is dropped. Deployed half of S-1 is the new S-5, waiting on a Cloudflare account. PR #1 then ran the CI check and passed, so F-7 closed on the same branch: 11 of 83, 13% | F-6, F-7, S-1, S-4 (started), S-5 (added), P-1, P-2 | package.json, package-lock.json, tsconfig.base.json, .nvmrc, web/*, worker/*, shared/package.json, docs/spikes/stack-spike.md, ROADMAP.md, PROJECT_STRUCTURE.md, docs/ARCHITECTURE.md, docs/ARCHITECTURE_ESSENTIALS.md; deleted ARCHITECTURE.md |
| 2026-10-26 | Agent (Claude) | Changed the stack from Framer to Astro 6 (static), one Cloudflare Worker (Hono) and D1. Rewrote ARCHITECTURE, ESSENTIALS and PROJECT_STRUCTURE. Updated PRD, DESIGN, AGENTS, CLAUDE, README, copy.md and this roadmap. Replaced the Framer spike with a stack spike, made the backend tasks unconditional, added conditional CMS tasks (K) and question Q13, removed the old gate G1 meaning | F-10, S-1 to S-4 (replaced), P (rewritten), B (now Must), K (added), D-9 (updated) | all docs, ROADMAP.md, PROJECT_STRUCTURE.md |
| 2026-10-10 | Agent (Claude) | Wrote docs/DESIGN.md from the supplied logo and added the logo files under assets/brand. Set the page background to black. Added tasks D-9 and P-21 and questions Q11 and Q12. Updated PROJECT_STRUCTURE, README, AGENTS, ESSENTIALS, PRD, ARCHITECTURE, PLACEHOLDERS and verification-log | F-9, D-9 (added), P-21 (added), P-1 and C-1 (updated) | docs/DESIGN.md, assets/brand/*, PROJECT_STRUCTURE.md, README.md, AGENTS.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/ARCHITECTURE_ESSENTIALS.md, content/*, ROADMAP.md |
| 2026-10-06 | Agent (Claude) | Prepared the GitHub repo skeleton: README, .gitignore, CODEOWNERS, PR template, CI checks for ROADMAP and PROJECT_STRUCTURE, content skeletons, research notes. Wrote repo-setup.sh. The repo does not exist on GitHub until Ademola runs it | F-6 (in progress), F-7 (in progress), F-8 | README.md, .gitignore, .github/*, content/*, docs/research/*, PROJECT_STRUCTURE.md, AGENTS.md, docs/ARCHITECTURE.md, ROADMAP.md |
| 2026-10-06 | Agent (Claude) | Created ROADMAP.md and PROJECT_STRUCTURE.md. Added the contribution protocol to AGENTS.md, CLAUDE.md, PRD, ARCHITECTURE and ESSENTIALS. Replaced the manual phase line in AGENTS.md with this file | F-5 | ROADMAP.md, PROJECT_STRUCTURE.md, AGENTS.md, CLAUDE.md, PRD.md, ARCHITECTURE.md, ARCHITECTURE_ESSENTIALS.md |
| 2026-10-06 | Agent (Claude) | Wrote AGENTS.md and CLAUDE.md | F-4 | AGENTS.md, CLAUDE.md |
| 2026-10-06 | Agent (Claude) | Stress-tested the PRD and ARCHITECTURE and cut overbuilt items (v0.2) | F-1, F-2, F-3 | PRD.md, ARCHITECTURE.md, ARCHITECTURE_ESSENTIALS.md |
| 2026-10-05 | Agent (Claude) | First drafts of PRD, ARCHITECTURE and ESSENTIALS (v0.1) | F-1, F-2, F-3 | PRD.md, ARCHITECTURE.md, ARCHITECTURE_ESSENTIALS.md |
| 2026-10-05 | Agent (Claude) | Reviewed the reference site and generated the Canva-editable proposal deck | D-2, D-4 | Alpha_Movies_Proposal.pptx |
