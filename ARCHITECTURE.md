# ARCHITECTURE: Alpha Movies Booking and Showcase Site

Status: Draft v0.3 (stack changed from Framer to Astro, Worker and D1; see decision D13) | Date: 2026-10-26 | Pairs with PRD.md. Requirement IDs (FR-n) refer to the PRD.

Items marked "Verify" are technical assumptions to confirm before depending on them (section 13).

Living docs: `ROADMAP.md` tracks status and `PROJECT_STRUCTURE.md` maps the files. Both are updated on every contribution (section 16).

## 1. Build order

The thinnest thing that proves the pitch comes first.

| Phase | What exists | Backend |
|---|---|---|
| 0 | Astro static site, content in repo files, `EnquiryForm` island that builds the WhatsApp message in the browser. Deployed to a noindex preview URL on Cloudflare | None |
| 1 | Same site on the client's domain. Worker, D1, email and bot protection are added. A hosted CMS is added only if the owner will edit content himself (Q13) | Worker, D1, Resend, Turnstile |
| 1.5 | Parked features, each pulled in by its trigger (section 12) | As needed |
| 2 | Optional deposit | Worker plus payment provider |

Everything under "API" and "Data" below is Phase 1. Do not build it for Phase 0.

## 2. Overview

```
Visitor (mobile, often inside the Instagram in-app browser)
   |
   v
Cloudflare Worker (one deployment per environment)
   |-- static assets: the Astro build (HTML, CSS, small JS, images)
   |      served for every path except /api/*
   '-- /api/*  ->  Hono app
         |-- Origin check, honeypot, Turnstile verify, rate limit per contact
         |-- insert Enquiry into D1 (idempotent on client_request_id)
         |-- email owner (+ builder for 30 days) via Resend
         '-- returns { ref, whatsappUrl }

Confirmation screen in the EnquiryForm island:
visible "Open WhatsApp" button + copyable message
```

Phase 0 has no `/api/*`. The island builds the message locally with `shared/whatsapp.ts`.

The browser talks only to the Worker, from the same origin. The Worker is the source of truth for validation, storage, notification and the WhatsApp URL.

## 3. Stack decisions

| Layer | Choice | Why | Rejected |
|---|---|---|---|
| Site | Astro 6, TypeScript, static output | Sends almost no JavaScript by default, which suits a video-heavy site on mobile data. First-class content collections | Next.js on Vercel: heavier JS for a mostly static site, pick it if an admin or payment UI becomes central. Astro SSR adapter: reported Workers quirks around the prerender environment and image service, static output avoids it. Plain HTML with HTMX: hand-built content layer and facades. Framer: superseded, see D13 |
| Styling | Tailwind CSS v4, with `web/src/styles/tokens.css` as the single source of design tokens | Tokens come straight from DESIGN.md, no copies | CSS-in-JS |
| Interactivity | One Preact island for `EnquiryForm`, hydrated when visible. The portfolio filter is a small vanilla script | Keeps client JavaScript small | A full React app |
| Content | Astro content collections: YAML or Markdown files with Zod schemas in `web/src/content` | No vendor, reviewed in pull requests, schemas can enforce the verification rules | A hosted CMS from day one. Sanity is added only if Q13 is yes (ROADMAP section K) |
| API | Cloudflare Worker with Hono and Zod. The same Worker serves the static build through its assets binding, running first for `/api/*` [Verify] | Same origin, no CORS, one deploy | A second Worker with CORS. It is the fallback if single-Worker routing fails |
| Data | D1 (SQLite) | `UNIQUE` constraints give real idempotency and unique refs, no extra vendor, same platform | Airtable: external vendor, no unique constraint, API limits. Supabase: more than this needs |
| Email | Resend | One API call per enquiry | SMTP |
| Bot protection | Turnstile, honeypot field, rate limit per contact (a D1 count) | Free, low friction | Image CAPTCHA |
| Phone parsing | libphonenumber-js (minimal metadata) in the Worker, light checks in the browser | Local numbers with a leading 0, foreign numbers, E.164 output | Regex |
| Video | YouTube nocookie or Vimeo, created on tap | His channel is on YouTube | Autoplaying embeds, a hero loop |
| Images | Astro build-time image optimization for posters and the logo | No runtime image service needed | A runtime transform service |
| Fonts | Astro's built-in Fonts API for Marcellus and Inter [Verify] | Preload and swap handled for us | Hand-rolled font loading |
| Analytics | GA4, two events: form_submit, whatsapp_tap | Free | A custom tracking endpoint |
| Tooling | Node 22 or newer, npm workspaces, strict TypeScript, Vitest, ESLint, `astro check`, Wrangler, GitHub Actions | Astro 6 needs Node 22+ | |

Validation for requests lives on the server in Zod. The browser uses native HTML validation only. Content schemas (Zod, in `web/src/content.config.ts`) enforce the content rules at build time.

## 4. Components and boundaries

| Component | Responsibility | Must not |
|---|---|---|
| Astro pages and components | Layout, copy, rendering content collections, SEO | Hold secrets or business rules |
| `EnquiryForm` island | Field UI, light validation, submit, confirmation screen with the WhatsApp button and copy fallback, local fallback link | Auto-open WhatsApp after an async call |
| `shared/whatsapp.ts` | Message and `wa.me` URL builders. Pure functions used by the island and the Worker | Import from web or worker code |
| `shared/site-config.ts` | The one place for the owner WhatsApp digits and the site origin | Hold secrets |
| Worker (Hono) | Validate, normalize phone, verify Turnstile, rate limit, insert, notify, build the WhatsApp URL | Block the WhatsApp handoff on a downstream failure |
| `db.ts` | The only file that talks to D1 | Leak query details outside its module |
| `notify.ts` | Send the owner email | Throw into the request path |

## 5. Data models

### Content collections (files in `web/src/content`, schemas in `web/src/content.config.ts`)

| Collection | Fields |
|---|---|
| projects | slug, title, category (enum), client_name, event_name, year, location, video_url, poster (image), hero_reel (bool), deliverables (list), summary, publish_ok (bool, client permission), verified (bool), sort_order |
| credentials | type (registration, equipment, collaboration, press), label, value, source (text), verified (bool) |
| settings (single file) | from_price_text, response_time_text, base_city, instagram_url, youtube_url |

Render rules, enforced in code: a project shows only if `verified` and `publish_ok` are both true. A credential shows only if `verified` is true. A category chip with zero shown projects is hidden. The credentials section is hidden while it has fewer than [N] shown items.

Build guard: the schema fails the build if any item with `verified: true` still contains a bracketed placeholder. Placeholders cannot reach production through verified items.

The owner WhatsApp number is defined once, in `shared/site-config.ts`, and imported by both the site and the Worker.

### D1: `enquiry` table (migration `worker/migrations/0001_init.sql`)

| Column | Type | Notes |
|---|---|---|
| id | integer, primary key | |
| ref | text, `UNIQUE` | `AM-` plus 5 Crockford base32 characters. Not sequential |
| client_request_id | text, `UNIQUE` | UUID generated by the form instance, the idempotency key |
| created_at | text (UTC ISO) | |
| status | text | new, handled, spam. `CHECK` constrained |
| name | text | |
| company | text, nullable | |
| whatsapp_e164 | text, nullable | |
| email | text, nullable | A `CHECK` requires at least one of whatsapp_e164 or email |
| project_type | text | festival, wedding_event, commercial, documentary, other |
| event_date | text | `YYYY-MM-DD`, interpreted in Africa/Lagos |
| event_end_date | text, nullable | Multi-day or second event |
| date_flexible | integer (0 or 1) | |
| short_notice | integer (0 or 1) | Event within 7 days of submission |
| venue, city, country | text | city and country required |
| duration | text | half_day, full_day, multi_day, unsure |
| deliverables | text | JSON array of highlight_reel, full_film, same_day_edit, drone, social_cuts, other |
| reference_url | text, nullable | http or https only |
| notes | text, nullable | Max 1000 characters |
| consent_at | text | |
| source | text, nullable | UTM source, if present |

Indexes: `created_at`, and `(whatsapp_e164, email, created_at)` for the per-contact rate limit. No IP address is stored.

## 6. API contract

Same origin as the site. The Worker rejects requests whose `Origin` header does not match the configured site origin.

### POST /api/enquiries

Request: the PRD section 7 fields plus `clientRequestId`, `turnstileToken` and a honeypot field `website` that must be empty.

Response 201:
```json
{
  "ref": "AM-7K3Q5",
  "whatsappUrl": "https://wa.me/2348012345678?text=<urlencoded brief>"
}
```

`whatsappUrl` format: digits only, with the country code, no plus sign and no leading zeros. The digits come from `shared/site-config.ts`.

Errors use one shape: `{ "error": { "code": "VALIDATION" | "BOT" | "RATE_LIMIT" | "ORIGIN" | "INTERNAL", "fields": { "city": "Required" } } }`.

If the `client_request_id` already exists, return 200 with the stored `ref` and a rebuilt `whatsappUrl`, and write nothing.

If D1 or the email call fails after validation passes, still return 201 with `ref: null` and a valid `whatsappUrl`. Log the failure. The message omits the Ref line.

Deferred endpoints are listed in section 12.

## 7. Key flows

### Enquiry submission

1. Visitor completes the form. The island generates a `clientRequestId` once per form instance.
2. Browser posts to `/api/enquiries`. The submit button is disabled while the request is in flight.
3. Worker checks the origin, the honeypot and Turnstile.
4. Worker validates with Zod, normalizes the phone number to E.164, computes `short_notice`.
5. Worker checks the per-contact rate limit with a D1 count (3 per hour per phone or email).
6. Worker inserts the row. On a `UNIQUE` conflict for `client_request_id` it reads the stored row and returns it.
7. Worker sends the owner email with `waitUntil`, so the response is not delayed.
8. Worker returns `{ ref, whatsappUrl }`.
9. The island shows the confirmation screen: reference code, a visible "Open WhatsApp" button that is a plain link, and the copyable message. No automatic redirect, because popups opened after an async call are commonly blocked on iOS Safari and in in-app browsers. [Likely]

### Failure handling

| Failure | Behaviour |
|---|---|
| Turnstile fails or cannot load | Show a retry. After two failures show the direct WhatsApp link |
| Rate limit hit | 429, show the direct WhatsApp link |
| D1 down | 201 with `ref: null`, log, handoff proceeds |
| Email down | The enquiry is saved, log it. The builder sees it in D1 |
| API unreachable | The island builds a WhatsApp link locally from the form values |
| Visitor never taps Send | The stored enquiry and owner email still carry the lead |

A lead is lost only if the backend failed and the visitor did not send the message. Accepted.

## 8. Security and privacy

- Secrets live only in Worker environment variables and `.dev.vars` locally. The only value shipped to the browser is the public Turnstile site key.
- Input caps on every field. Strip control characters. URLs must be http or https.
- Rate limit: 3 submissions per hour per phone number or email, plus Turnstile. Do not rely on IP, because mobile carriers in Nigeria commonly put many users behind one address [Likely]. A loose IP backstop through the Workers rate limiting binding is optional [Verify].
- Security headers, including a Content Security Policy that allows Turnstile, GA4 and the YouTube nocookie domain, are set through `web/public/_headers` [Verify that Worker assets honor it].
- Logs hold the ref and error codes only. No names, numbers or emails.
- No IP addresses are stored.
- Consent is stored with a timestamp. Retention: spam deleted after 30 days, other enquiries after 24 months unless the owner chooses otherwise. Deletion on request is a documented D1 command. [Verify against NDPA 2023]

## 9. Performance plan

- Static pages. Posters and the logo are optimized at build time.
- No hero video loop. Video iframes are created on tap.
- `EnquiryForm` hydrates when visible. The Turnstile script loads when the form section is first interacted with.
- Budgets: LCP 2.5s or better on 4G, checked with PageSpeed Insights and a throttled Chrome profile. Client JavaScript on the home page, excluding GA4 and Turnstile, targets [agree a number at P-17].

## 10. Environments, ownership and deployment

| Env | Site and API | Data |
|---|---|---|
| test | Worker on a `workers.dev` address, noindex | test D1 database |
| prod | Worker on the client's custom domain | prod D1 database |

Worker variables and bindings: binding `DB` (D1), `TURNSTILE_SECRET`, `RESEND_API_KEY`, `OWNER_EMAILS` (comma separated, owner plus builder for the first 30 days), `ALLOWED_ORIGIN`. Build-time public variable: `PUBLIC_TURNSTILE_SITE_KEY`.

Account ownership at launch:

| Account | Held by |
|---|---|
| Domain and DNS | Client |
| Cloudflare (Workers, D1, Turnstile) | Client, builder invited |
| GitHub repo | Client organization or transferred before handover |
| Resend | Client, with the sending domain verified (SPF and DKIM) |
| GA4 | Client |
| Sanity, if used | Client |

Handover checklist: all accounts above, how to rotate each secret, how to apply a D1 migration, how to delete an enquiry on request, how to update content, and a one-page owner guide.

Deploy: `npm run deploy:test` builds the web workspace, applies D1 migrations to the test database and runs `wrangler deploy --env test`. Production deploys happen only when asked.

## 11. Observability and testing

- Cloudflare Worker logs. Alert on a spike in INTERNAL errors. [Verify]
- First 30 days: every enquiry email also goes to the builder, so a silently failing owner inbox is noticed.
- Unit tests only: phone normalization, WhatsApp message builder (encoding and length), ref generator, the Zod request schema.
- CI on every PR: lint, typecheck, `astro check`, unit tests and the web build. The build runs the content guard.
- Manual pre-launch matrix: iOS Safari, Android Chrome, and the Instagram in-app browser on both. Check the WhatsApp button, the copy fallback, slow 3G throttle and a keyboard-only submit.
- Launch gate: the build passes with no unverified or unpermitted content visible and no bracketed placeholders in verified items.

## 12. Parked features and triggers

| Feature | Design sketch | Build only when |
|---|---|---|
| Availability picker | A `blocked_date` table in D1 (date, status, private note) and `GET /api/availability?month=YYYY-MM` returning dates only. Needs an owner-facing way to edit dates | The owner commits to updating dates at least weekly, and a simple edit surface exists |
| Owner dashboard | A protected page listing enquiries with a handled or spam toggle | Enquiries outgrow email, or the owner asks |
| Event tracking | `POST /api/events`, `wa_tapped` column | GA4 proves insufficient |
| Hosted CMS | Sanity project mirroring the content collections, build-time fetch, a webhook that triggers a rebuild | Q13 is yes (ROADMAP section K) |
| Deposit (Phase 2) | `POST /api/deposits/initiate`, `POST /api/webhooks/<provider>`, a `payment` table with integer kobo, idempotent on webhook event id, only a verified webhook marks paid | v1 live 60 days and the owner asks. Verify the provider's signature scheme first |

## 13. Verify before building

1. One Worker serves the Astro static build as assets and routes `/api/*` to Hono, locally and deployed to test. Fallback: two Workers with CORS.
2. Turnstile and the form submit work inside the Instagram in-app browser on iOS and Android, and the `wa.me` button opens WhatsApp there. Blocks the form design.
3. D1 and Workers free-tier limits against expected volume, and whether any paid plan is needed.
4. Resend free-tier limits, sending-domain verification for the client domain, and Gmail inbox placement.
5. `web/public/_headers` is honored for assets served by a Worker, and the CSP works with Turnstile, GA4 and YouTube nocookie.
6. Astro 6 specifics: the Fonts API handles Marcellus and Inter, the Preact integration works, content config lives at `src/content.config.ts`.
7. The Workers rate limiting binding, if the IP backstop is wanted.
8. NDPA 2023 obligations for names, phone numbers and email addresses.
9. `wa.me` links on iOS, Android and inside Instagram's browser. Keep the encoded message under about 1000 characters.

## 14. Stress test (technical)

### 14.1 What would break

Ranked by likelihood times damage. "Fixed" means the design already addresses it.

| # | Failure | Status |
|---|---|---|
| 1 | Owner does not maintain dates, so an availability calendar goes stale | Fixed: availability parked, email is the owner's interface |
| 2 | Auto-opening WhatsApp after an async call is blocked by popup rules and in-app browsers | Fixed: visible button is the handoff |
| 3 | The `wa.me` link built from E.164 with a plus sign does not work | Fixed: digits only |
| 4 | IP-based rate limiting blocks real users behind shared mobile addresses | Fixed: limit per contact, IP is an optional backstop |
| 5 | Turnstile or the form fails inside in-app browsers | Open: Verify item 2, with a WhatsApp link fallback after two failures |
| 6 | Owner emails land in spam or the sending domain is not verified | Open: Verify item 4, builder copied for 30 days |
| 7 | Double taps and retries create duplicate enquiries | Fixed: `UNIQUE client_request_id` |
| 8 | Duplicate refs or no unique guarantees | Fixed: `UNIQUE ref` in D1 |
| 9 | The owner WhatsApp number differs between places | Fixed: one definition in `shared/site-config.ts` |
| 10 | The credentials section looks empty because little is verified | Fixed: section hides below a threshold |
| 11 | Source video files do not exist, only Instagram uploads | Open: PRD Q7 |
| 12 | Accounts sit in the builder's name and the site breaks when he steps away | Fixed: client-owned accounts and a handover checklist |
| 13 | Single-Worker routing of assets and `/api/*` does not work as assumed | Open: Verify item 1, fallback is two Workers with CORS |
| 14 | Astro on Workers SSR quirks | Avoided: static output, no adapter |
| 15 | The owner cannot edit content himself | Open: default is builder-maintained files, Q13 decides on a hosted CMS |
| 16 | A placeholder or unverified claim ships | Fixed: the build guard fails the build |
| 17 | Astro or Node major upgrades add maintenance | Accepted: pinned versions, upgrade deliberately |

### 14.2 Edge cases handled

- Local phone formats with a leading 0, international numbers, and numbers not on WhatsApp (an email fallback exists).
- Multi-day events and two events for one couple (second date field).
- Past, same-day, short-notice and far-future dates. The window is today in Africa/Lagos to 24 months out, and the device clock is never trusted.
- Unicode names, emoji, over-long text, and URLs that are not http or https.
- An agency booking for a brand (company field).
- Existing clients bypassing the form (direct link, no JavaScript needed).
- Empty categories and empty credentials (hidden).
- A request to delete personal data (a documented D1 command).
- Bots (origin check, honeypot, Turnstile, rate limit). Fake submissions block nothing.

### 14.3 What was overengineered, and what changed

| Item | Verdict | Change |
|---|---|---|
| Worker and D1 for the pitch demo | Not needed to prove the idea | Phase 0 has no backend |
| Availability picker, `blocked_date`, `date_conflict` | Needs an owner habit nobody has promised | Parked |
| A `Store` interface over the database | An abstraction for a second backend that does not exist | One `db.ts` module |
| `/api/events` and `wa_tapped` | Duplicates GA4, and a tap is not a sent message | Removed |
| IP hashing | Stores data to solve a problem Turnstile already covers | Removed, nothing stored |
| Service and FAQ as content collections | Text that rarely changes | Written in the page |
| Self-hosted hero loop | Weight for little proof | Cut |
| A shared Zod schema in the browser | Extra bundle weight, duplicate logic | Server only, native validation in the browser |
| Three environments | One more database and Worker to maintain | Two: test and prod |
| A six-state status enum | The owner will not run a CRM | new, handled, spam |
| A hosted CMS from day one | A vendor and a rebuild pipeline before anyone asked to edit | Conditional on Q13 |
| A second Worker for the API | An extra deploy and CORS | One Worker serves both, with a fallback |
| Detailed Phase 2 design | Unrequested | A row in section 12 |

What stays because it earns its place: the verification gate and build guard, the handoff fallbacks, the direct link, idempotent submit and client-owned accounts.

## 15. Decision log

| # | Decision | Date |
|---|---|---|
| D1 | No budget field. Filter on effort and a public "from" price | 2026-10 |
| D2 | Availability check is parked. If built later: warn, still accept, never auto-block | 2026-10-06 |
| D3 | A backend failure never blocks the WhatsApp handoff | 2026-10 |
| D4 | Phase 0 has no backend. Superseded in part by D13: Phase 1 always builds a Worker | 2026-10-06 |
| D5 | Unverified or non-permitted content never renders | 2026-10-06 |
| D6 | Deposit is Phase 2, optional, and a stub until requested | 2026-10 |
| D7 | The handoff is a visible button, not an automatic redirect | 2026-10-06 |
| D8 | Rate limit by contact, not by IP alone | 2026-10-06 |
| D9 | No IP storage, no custom event endpoint | 2026-10-06 |
| D10 | Every account is held by the client | 2026-10-06 |
| D11 | Every contribution updates ROADMAP.md, and PROJECT_STRUCTURE.md when files change. CI enforces both | 2026-10-06 |
| D12 | Page background is black (#000000) with a gold ramp sampled from the supplied logo. Tokens live in docs/DESIGN.md | 2026-10-10 |
| D13 | Replace Framer with Astro 6 (static) plus one Cloudflare Worker (Hono) and D1. Reasons: remove the unverified Framer-runtime risk, give coding agents a codebase they can fully work in, keep client JavaScript small | 2026-10-26 |
| D14 | D1 replaces Airtable. Enquiries reach the owner by email, no owner dashboard in v1 | 2026-10-26 |
| D15 | Content lives in repo files with schema-enforced rules. A hosted CMS (Sanity) is added only if Q13 is yes | 2026-10-26 |
| D16 | The owner WhatsApp number is defined once in `shared/site-config.ts` | 2026-10-26 |
| D17 | One Worker serves the static build and `/api/*` on the same origin. Fallback is two Workers with CORS | 2026-10-26 |
| D18 | Design tokens have one implementation source, `web/src/styles/tokens.css`, derived from DESIGN.md | 2026-10-26 |

## 16. Contribution protocol

Every contribution, by a human or an agent, updates the living docs before it counts as done.

1. `ROADMAP.md`: set the status of every task you touched, add tasks you discovered, recalculate the scorecard, and add one Progress log line (date, who, what, task IDs, files). This file changes on every contribution without exception.
2. `PROJECT_STRUCTURE.md`: if you added, moved, renamed or deleted a file or folder, or changed its purpose, update the tree, the file table and the Structure change log.
3. `ARCHITECTURE.md` decision log and `ARCHITECTURE_ESSENTIALS.md`: if a decision or rule changed.
4. In your final report, say which of these you updated. A contribution is not done until they are.

Enforcement: CI fails any PR that does not change `ROADMAP.md`, and any PR that adds, deletes or renames a file without changing `PROJECT_STRUCTURE.md` (task F-7). CI checks that the files changed, not that the edits are accurate, so the PR template and review still matter. Making the check required through branch protection may need a paid GitHub plan on a private repo. [Verify]
