# ARCHITECTURE: Alpha Movies Booking and Showcase Site

Status: Draft v0.12 (L-6 in section 10 and D30: `npm run deploy:test` is the only deploy pipeline. The dashboard build integration is off this repo, and the finding worth keeping is that deleting the Worker it was keyed to did not remove the Builds project, because that object outlives its Worker; uninstalling the Cloudflare GitHub App is what stopped the checks. Earlier: P-27 adds one render rule to section 5, the label a reel item wears, and re-renders the placeholder clips, and section 9 now carries that build's wire readings. Before that: D29 turns the showreel into a carousel and lifts the autoplay ban for one muted, self-hosted first clip; section 5 records the reel's render rules, the poster path resolver and the client-safe split in media-sources.ts, and section 9 carries the clip byte budget. D27 fixes the responsive scale, D28 settles the content schema, the demo placeholder flag and where the verification guard bites; section 11 now says what CI actually runs. D23 to D26 record how the site handles unverified content, unapproved sentences and its own JavaScript) | Date: 2026-10-28 | Pairs with PRD.md. Requirement IDs (FR-n) refer to the PRD.

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
| Site | Astro 7, TypeScript, static output, pinned 7.4.1 | Sends almost no JavaScript by default, which suits a video-heavy site on mobile data. First-class content collections. Astro 6.x carries the advisories in D20 and 7.4.1 is the newest release whose Node floor this machine meets (D22) | Next.js on Vercel: heavier JS for a mostly static site, pick it if an admin or payment UI becomes central. Astro SSR adapter: reported Workers quirks around the prerender environment and image service, static output avoids it. Plain HTML with HTMX: hand-built content layer and facades. Framer: superseded, see D13 |
| Styling | Tailwind CSS v4 through `@tailwindcss/vite`, with `web/src/styles/tokens.css` as the single source of design tokens mapped to utilities by `@theme inline` in `global.css`, and the DESIGN section 7 component specs written once as classes in an `@layer components` block there | Tokens come straight from DESIGN.md, no copies, and a utility emits `var(--gold)` rather than a second hex value | CSS-in-JS |
| Interactivity | One Preact island for `EnquiryForm`, hydrated when visible. The portfolio filter is a small vanilla script | Keeps client JavaScript small | A full React app |
| Content | Astro content collections: YAML or Markdown files with Zod schemas in `web/src/content` | No vendor, reviewed in pull requests, schemas can enforce the verification rules | A hosted CMS from day one. Sanity is added only if Q13 is yes (ROADMAP section K) |
| API | Cloudflare Worker with Hono and Zod. The same Worker serves the static build through its assets binding, running first for `/api/*`. Verified locally and at the edge, see D17 | Same origin, no CORS, one deploy | A second Worker with CORS. It is the fallback if single-Worker routing fails, and it stayed unused |
| Data | D1 (SQLite) | `UNIQUE` constraints give real idempotency and unique refs, no extra vendor, same platform | Airtable: external vendor, no unique constraint, API limits. Supabase: more than this needs |
| Email | Resend | One API call per enquiry | SMTP |
| Bot protection | Turnstile, honeypot field, rate limit per contact (a D1 count) | Free, low friction | Image CAPTCHA |
| Phone parsing | libphonenumber-js (minimal metadata) in the Worker, light checks in the browser | Local numbers with a leading 0, foreign numbers, E.164 output | Regex |
| Video | YouTube nocookie or Vimeo, created on tap. Since P-4 the tap handler exists and picks the nocookie iframe as soon as a video id is set; until then it plays a silent stand-in from `web/public/media` (C-2 has not delivered footage) | His channel is on YouTube | Autoplaying embeds, a hero loop |
| Images | Astro build-time image optimization for posters and the logo. The logo builds to a 48 kB WebP from the 160 kB source | No runtime image service needed | A runtime transform service |
| Fonts | Astro's built-in Fonts API for Marcellus and Inter. Verified at P-1: it downloads woff2 at build time, serves them from the same origin, and adds `font-display: swap`, preload links and metric-matched fallback faces | Preload and swap handled for us, and no third-party font host in the CSP | Hand-rolled font loading. A Google Fonts `<link>`, which would add two origins to the CSP and a render-blocking request |
| Analytics | GA4, two events: form_submit, whatsapp_tap | Free | A custom tracking endpoint |
| Tooling | Node 22.22 or newer, npm workspaces, strict TypeScript, Vitest, ESLint, `astro check`, Wrangler, GitHub Actions | Astro 7.4.1 and `@astrojs/preact` 6.1.0 both ask for Node 22.22+ | |

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
| projects | slug, title, category (enum), client_name, event_name, year, location, video_url (`/media/...` file we serve, or a YouTube link), poster (path string under `web/src/assets`, resolved by `web/src/poster-index.ts`), hero_reel (bool), deliverables (list), summary, publish_ok (bool, client permission), verified (bool), sort_order, demo (bool, D28). Built at P-5 in `web/src/content-rules.ts` and wired in `web/src/content.config.ts`; the carousel fields (`poster` as a resolvable path, `hero_reel` read by the reel) landed with P-26 |
| credentials | type (registration, equipment, collaboration, press), label, value, source (text), verified (bool) |
| settings (single file) | from_price_text, response_time_text, base_city, instagram_url, youtube_url |

The slug is not stored in the file: the projects loader takes the entry id from the file name stem, so a project cannot disagree with its own name, and that id is what the P-7 project pages route on.

Render rules, enforced in code: a project shows only if `verified` and `publish_ok` are both true (`shorableProjects` in `content-rules.ts`); while none is, the designed placeholders stand in, and nothing that is merely unverified is ever visible (`visibleProjects`). The showreel carousel is the visible projects flagged `hero_reel` (`reelItems`), which is what keeps a wedding without permission off the reel. What an item is called is a rule as well: the grid prints a placeholder entry's bracketed `[project title]` unchanged, because a bracket there is a note to the builder that the row is unfinished (D23), while the reel prints the stand-in label in `placeholderReelTitle` through `reelTitle`, because D25 asks the demo surface to read as finished and a bracket in the middle of a carousel looks like a bug rather than a marker. A shorable entry prints its own title in both. A credential shows only if `verified` is true. A category chip with zero shown projects is hidden. The credentials section is hidden while it has fewer than [N] shown items.

The two functions that decide what a video source is (`isSelfHostedVideo`, `youtubeEmbedUrl`) live in `web/src/media-sources.ts`, not in `content-rules.ts`, because the reel's client script needs them and `content-rules.ts` imports zod. Nothing that runs in a visitor's browser may pull a schema library in.

Build guard: the schema fails the build if any item with `verified: true` still contains a bracketed placeholder. Placeholders cannot reach production through verified items. Implemented at P-5 as a refinement on the projects schema, so Astro validates each entry at sync and build and reports the offending file and field paths; the same refinement refuses a `demo: true` entry that also claims `verified` or `publish_ok`, and requires a verified entry to hold the fields the project page shows (a name, the year, the poster, at least one deliverable, and a `video_url` that actually plays: a `/media` file or a YouTube link carrying an id). The rule itself, `bracketedFieldsIn`, is a pure function in `content-rules.ts` so `content-rules.test.ts` can exercise it without a build. Proven against the real build on 2026-10-27: a verified entry with brackets exited 1 naming six field paths, and an entry with an unlisted category and a non-integer `sort_order` exited 1 on the enum and the type.

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
- Security headers, including a Content Security Policy that allows Turnstile, GA4 and the YouTube nocookie domain, are set through `web/public/_headers`, which **is** honored for assets served by a Worker (S-3, 2026-10-27). It is not honored for `/api/*`, so the Worker sets its own `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options` in Hono middleware (D21). Fonts are self-hosted at build time, so `font-src` and `style-src` carry no Google origins; `style-src 'unsafe-inline'` stays, because the Fonts API injects an inline `@font-face` block (P-1, 2026-10-27).
- Logs hold the ref and error codes only. No names, numbers or emails.
- No IP addresses are stored.
- Consent is stored with a timestamp. Retention: spam deleted after 30 days, other enquiries after 24 months unless the owner chooses otherwise. Deletion on request is a documented D1 command. [Verify against NDPA 2023]

## 9. Performance plan

- Static pages. Posters and the logo are optimized at build time.
- No hero video loop. Video iframes are created on tap, and the only clip that may start by itself is the showreel's first item, muted and looping (D29). It waits for `load`, so it cannot compete with the hero's LCP. Measured on the wire under `wrangler dev` with the real `_headers`, on the P-27 build: 0 requests and 0 kB of video at the top of the page, and one request for `/media/demo-reel-1.mp4` once the clip is asked for, 40,560 B of body and 40,860 B on the wire in 47 ms, delivered whole in a single response (so the byte-range question on the deployed edge stays open at P-17). The three placeholder clips are 7 seconds, 1280 x 720, H.264 CRF 32, at 41, 57 and 69 kB on disk; the six reel stills cost 8,982, 10,216 and 9,580 B for the stage's 1280 width variants and 706, 802 and 742 B for the strip's 176 width variants, just over 30 kB for all of them. P-26 recorded 66.4 kB fetched, which was that build's larger file. The standing budget for a reel clip stays 15 seconds and 400 kB.
- `EnquiryForm` hydrates when visible. The Turnstile script loads when the form section is first interacted with.
- Budgets: LCP 2.5s or better on 4G, checked with PageSpeed Insights and a throttled Chrome profile. Client JavaScript on the home page, excluding GA4 and Turnstile, targets [agree a number at P-17].
- Measured at P-1, one scaffold page: 3.0 kB HTML, 6.2 kB CSS, 0 kB JavaScript referenced (the Preact chunks build but nothing hydrates yet), 61 kB of self-hosted woff2 (Marcellus 13.9, Inter variable 47.3) and a 48.6 kB logo WebP. These are uncompressed file sizes, and they are the floor the P-17 budget starts from.

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

Deploy: `npm run deploy:test` builds the web workspace and runs `wrangler deploy --config worker/wrangler.toml`, and later applies D1 migrations to the test database. A bare `npx wrangler deploy` from the repo root fails: wrangler refuses to run in the root of an npm workspace (found by the Cloudflare dashboard build on 2026-10-27), which is why the script passes `--config`. Production deploys happen only when asked. Exactly one pipeline owns deploys: `npm run deploy:test`. The Cloudflare dashboard GitHub integration that onboarding attached to this repo was disconnected on 2026-10-28 (L-6), and it took two moves, because deleting the Worker it was keyed to did not remove the Workers Builds project. That object survives its Worker and kept posting a failing check on every push and PR, and in Cloudflare's own UI Builds settings live inside the Worker, so an orphan with no Worker had no entry point left. What ended it was uninstalling the Cloudflare Workers and Pages GitHub App, which is both the trigger and the reporter of the check. Any future Workers Builds project attached here must carry `npm run deploy:test` as its deploy command, or not exist: a green build publishes without anyone choosing to. Reinstalling that app is step one of building such a pipeline, not a detail to skip.

## 11. Observability and testing

- Cloudflare Worker logs. Alert on a spike in INTERNAL errors. [Verify]
- First 30 days: every enquiry email also goes to the builder, so a silently failing owner inbox is noticed.
- Unit tests only: phone normalization, WhatsApp message builder (encoding and length), ref generator, the Zod request schema. Plus two build-hygiene suites that exist in the repo today: `web/src/styles/design-tokens.test.ts` (tokens.css declares every DESIGN.md section 3 token, no other source file contains a hex literal, and no responsive variant outside the design's breakpoints) and, from P-5, `web/src/content-rules.test.ts` (the verification guard and the render predicates, run against the schema directly).
- CI on every PR today: the two doc-discipline checks in `.github/workflows/ci.yml` (ROADMAP.md must change; PROJECT_STRUCTURE.md must change when files are added, deleted or renamed). It does not run lint, typecheck or the build yet. The content guard therefore bites at `astro build`, which is what `npm run build` and `npm run deploy:test` run, so an entry that breaks a rule stops a deploy rather than a merge. Ademola chose that at P-5 over adding a build job to CI; the trade-off is in D28 and a CI build job can still be added later without touching the guard.
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

1. One Worker serves the Astro static build as assets and routes `/api/*` to Hono. Fallback: two Workers with CORS. **Verified locally and on the edge 2026-10-27** (`docs/spikes/stack-spike.md`, S-1 and S-5): `[assets] run_worker_first = ["/api/*"]` serves the build for every path except `/api/*`, which reaches Hono, both in `wrangler dev` and on a deployed `workers.dev` Worker. Two side effects found and covered by D19: an asset miss fell through to the Worker, which P-2 closed by setting `not_found_handling = "404-page"` and shipping `404.astro`, and `POST` outside `/api/*` returns 405 from the assets layer without reaching Hono.
2. Turnstile and the form submit work inside the Instagram in-app browser on iOS and Android, and the `wa.me` button opens WhatsApp there. Blocks the form design.
3. D1 and Workers free-tier limits against expected volume, and whether any paid plan is needed.
4. Resend free-tier limits, sending-domain verification for the client domain, and Gmail inbox placement.
5. `web/public/_headers` is honored for assets served by a Worker, and the CSP works with Turnstile, GA4 and YouTube nocookie. **Answered 2026-10-27 for the mechanism** (S-3, `docs/spikes/stack-spike.md`): `_headers` applies to asset responses and asset redirects, and does not apply to `/api/*` or to an asset miss that falls through to the Worker. **Partly answered for the values** (P-1, 2026-10-27): the page loads under the enforced CSP with no console violations, which exercises `font-src 'self'` for the self-hosted woff2 files and `style-src 'unsafe-inline'` for the inline font block Astro injects. Turnstile and GA4 stay unexercised until they exist at P-12. **YouTube nocookie answered 2026-10-27** (P-4): with a throwaway video id the tap created `https://www.youtube-nocookie.com/embed/...?autoplay=1&rel=0`, the frame document returned 200 and the console stayed empty under the enforced policy, so `frame-src` is right as written. The id was reverted and nothing YouTube-linked is committed. Two related findings from the same task: the CSP also blocks Astro's inlined component scripts, which is decision D26, and byte-range seeking behaved differently on `wrangler dev` than expected (the media request gets 206, but a seek to 2.2 s restarted playback from 0), so re-check seeking on the deployed edge before P-17's mobile pass. **Re-checked at P-26 (2026-10-28)**: the carousel's self-hosted muted clip starts and plays under the enforced policy with an empty console, which exercises `media-src` falling through to `default-src 'self'` for `/media/*.mp4`, and no CSP change was needed. Byte-range seeking on the edge stays open at P-17.
6. Astro specifics: the Fonts API handles Marcellus and Inter, the Preact integration works, content config lives at `src/content.config.ts`. **Answered 2026-10-27 on Astro 7.4.1** (P-1): the Fonts API resolved both families from the Google provider, copied 2 woff2 files into `/_astro/fonts/`, emitted `@font-face` with `font-display: swap`, preload links and metric-adjusted fallback faces, and exposed `--font-marcellus` and `--font-inter`; `@astrojs/preact` 6.1.0 installs and builds on this Node. Content config is still open, it arrives at P-5.
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
| 13 | Single-Worker routing of assets and `/api/*` does not work as assumed | Fixed: verified locally and against a deployed Worker (S-1, S-5, 2026-10-27). Fallback remains two Workers with CORS, unused so far |
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
| D19 | Asset misses fall through to the Worker even with a scoped `run_worker_first`, so an unscoped `app.all("*")` in the Worker turns a missing page into a JSON 404. Set `not_found_handling` in `[assets]`, ship a real 404 page, and scope the Worker catch-all to `/api/*`. **Remedy in place and re-probed at P-2:** `not_found_handling = "404-page"` plus `web/src/pages/404.astro`, and `/missing.html` and `/no-such-path` now return the HTML page with status 404 and the full `_headers` policy, while `/api/*` still reaches Hono unchanged | 2026-10-27 (found by S-1, closed by P-2) |
| D20 | Astro stays pinned at 6.4.8 for the spike because every doc says Astro 6, but 6.x carries a critical advisory fixed only in 7.3.2+, which needs Node newer than 22.23.4. Move to Astro 7.x at P-1 with a Node bump rather than carrying the advisory into the first real build | 2026-10-27 (found by S-1) |
| D21 | `web/public/_headers` governs asset responses and asset redirects only. `/api/*` and any asset miss that falls through to the Worker get nothing from it, so the Worker sets its own security headers in middleware, and the site is not switched to `run_worker_first = true` just to make headers apply everywhere | 2026-10-27 (found by S-3) |
| D22 | Settles D20, whose Node premise was wrong. The Astro advisories are fixed in 7.3.2, which asks for Node 22.12, and 7.4.0 to 7.4.1 ask for 22.22. Only 7.4.2 wants 22.23.4, which this box cannot reach through apt. So Astro is pinned at exactly 7.4.1, `@astrojs/preact` at 6.1.0 (22.22 floor, preact 10 or 11) and preact at 11.0.2, the Node floor in `package.json` engines moves to 22.22, and no Node install is needed. `npm audit` reports 0 vulnerabilities, and checks A1 to A9 plus the S-3 header scope reproduce unchanged on the new build. Pin exactly, not with a caret: `^7` would resolve to 7.4.2 and fail the engine check on this machine | 2026-10-27 (found by P-1) |
| D23 | The page skeleton renders neutral blocks labelled DEMO wherever content is not verified or permitted yet, and every unknown stays a `[bracketed]` entry in content/PLACEHOLDERS.md. FR-6, FR-7 and FR-27 hide unverified items rather than show them, and a Phase 0 pitch demo with hidden sections proves nothing about layout. Both rules hold: nothing unverified makes a claim, and the space it will occupy is still designed | 2026-10-27 (P-2) |
| D24 | While Q12 is open, the site chrome (nav brand, page title, copyright) reads **Boy Concept** and the supplied 3D logo stays in the hero and the footer, where its artwork still spells ALPHA MOVIES. Ademola's interim call, not Emmanuel's answer. The nav uses text rather than the logo because the 3D mark cannot be 220 px wide inside a 64 px bar (DESIGN section 2 rule 4 against section 7). P-21 produces the flat wordmark and Q12 still decides the name before launch | 2026-10-27 (P-2) |
| D25 | Where a task's deliverable is a sentence the client has not written yet, the builder may draft one so the demo reads as finished, under three conditions: it makes no claim a `content/verification-log.md` row would not have to back (no superlative, no stat, no client name, per DESIGN section 10), its alternatives and reasoning are written into `content/copy.md`, and `content/PLACEHOLDERS.md` carries it as an open row so launch stays blocked until the client picks one. This narrows the "never invent copy, use brackets" rule for marketing sentences only; it does not touch facts, prices, credentials or numbers, which stay bracketed. P-3 used it for the hero headline. The risk is stated plainly: a pitch demo can now carry a line the client never chose, and the register is the only thing that catches it | 2026-10-27 (P-3, at Ademola's direction) |
| D26 | Component scripts must reach the browser as external files. Astro 7.4.1 inlines a small `<script>` from a `.astro` component into the page as an inline module, and the site's CSP (`script-src 'self'`, no `unsafe-inline`) then refuses to run it: the tap handler silently does nothing, with a console violation as the only clue. `vite.build.assetsInlineLimit: 0` in `web/astro.config.mjs` makes the emitted script a `/_astro/*.js` file, which the policy allows. Verified both ways in a browser under `wrangler dev` with the real `_headers`. Do not fix this by adding `unsafe-inline`, a hash or a nonce: hashes change per build and per page, and `_headers` is a single static file with no per-page slot (see also D21). Every later island, including the P-12 form, depends on this setting | 2026-10-27 (found by P-4) |
| D27 | The responsive scale is DESIGN section 5's, not Tailwind's default. The skeleton inherited 640, 768, 1024 and 1280 as available utilities while the design names 768, 1200 and 1440, and the mismatch was measurable rather than theoretical: at 1024 the portfolio rendered three columns and the process five, leaving 128 px of text inside a step card. `global.css` resets `--breakpoint-*` and declares only md 768, lg 1200 and xl 1440, so an unlisted variant emits no CSS at all, and `design-tokens.test.ts` fails the build if a `sm:`, `xs:` or `2xl:` appears in `web/src`. The same pass single-sourced the container and gutters as `.container-site`, because ten components each carried their own copy of the gutter and the design's 40 px desktop step existed in none of them. Trade-off to keep in mind: a mistyped variant now fails silently in CSS but loudly in the test, so the test is load-bearing and must not be relaxed | 2026-10-27 (found by P-25) |
| D28 | Two calls from P-5. First, the placeholder marking: the DEMO project cards became real entries in the projects collection carrying an explicit `demo: true`, chosen over leaving them as hardcoded cards in `PortfolioGrid.astro` and over a `demo-` file name convention. The reason is the private-wedding case. A grid that falls back to "everything not verified" would put real, unpermitted work in front of a prospect, so the fallback is "entries marked demo", and the schema refuses `demo: true` beside `verified: true` or `publish_ok: true`. An entry that is neither is invisible in both modes, which is the FR-27 rule with a third state added. Second, the guard lives in the schema and nowhere else: it fails `astro build`, so `npm run build` and `npm run deploy:test` catch it, and no CI job was added, because `ci.yml` is doc-discipline only and a build job there would go red for reasons that have nothing to do with content. The cost of that choice is timing: a bad entry surfaces at build or deploy rather than at PR review, and `content-rules.test.ts` is what narrows the gap. This row is also the change to the ARCH section 5 data model that AGENTS.md requires asking about first; Ademola picked it from the three options on 2026-10-27 | 2026-10-27 (P-5, at Ademola's direction) |
| D29 | Ademola asked for the showreel to become a carousel of different videos that autoplays, which collides with four written rules (PRD FR-2 and section 9, ESSENTIALS rule 10, DESIGN section 8), all of which say the visitor presses play before a byte moves. Rather than break them quietly, the collision was priced and put to him: an autoplaying reel costs mobile-data visitors bandwidth the site was explicitly built not to spend, and an autoplaying iframe would also drag a third-party origin into the LCP. He chose the narrow form, **muted autoplay for the first clip only**. The rules now read: one item may start by itself, only when its source is a file we serve, muted, looping, silent, after `load`, and only while the stage is at least half on screen; it pauses off-screen, carries a visible 44 px pause control (WCAG 2.2.2) and a `prefers-reduced-motion` escape, and is capped at 15 seconds and 400 kB. Every other carousel item and every YouTube source stays tap-only, and no iframe ever starts by itself. Turning the sound on hands the clip to the visitor: native controls appear, the loop stops and the scroll gate lets it run, because restarting an audible clip when someone scrolls back is worse than the byte it saves. What is given up: the reel is no longer strictly zero-bytes-until-tap, and the first clip is downloaded by any visitor who scrolls that far. Trade-off recorded for P-17, which measures the LCP and the throttled cost of exactly this | 2026-10-28 (P-26, at Ademola's direction) |
| D30 | L-6, decided: disconnect rather than rewire, and closed by removing the app rather than the Worker. The Cloudflare dashboard held a Workers Builds project attached to this repo that posted a failing check on every push and PR: it ran `npx wrangler deploy` from the workspace root, where there is no `wrangler.toml`, and it was keyed to a Worker named `boy-concept` that onboarding had created as the default hello-world stub on 2026-10-27T08:12Z, never modified, never reachable (`boy-concept.ademola2993k.workers.dev` answered 404 with Cloudflare error 1042) and never this repo's target, because `worker/wrangler.toml` builds `boy-concept-spike`. L-6's two branches were to set its command to `npm run deploy:test` or remove it. Rewiring was rejected on purpose: that command deploys the spike rig, so a green build would push to it on every push nobody asked for, which AGENTS.md reserves for an explicit request, and deploy authority would live outside the repo. So the stub Worker was deleted through the API (`DELETE /accounts/{account}/workers/scripts/boy-concept`, success, and the account was left with one service). That is where the plan was wrong, and the correction is the durable part: **a Workers Builds project is not part of the Worker.** It outlives it, keeps triggering, and Cloudflare manages Builds from inside the Worker's Settings, so an orphan with no Worker becomes unreachable from the dashboard. Deleting the Worker is not a way to remove a build pipeline. What ended the check was Ademola uninstalling the Cloudflare Workers and Pages GitHub App, the object that both receives the push and creates the check run; whether a record still sits in Cloudflare's CI store is unknown and now harmless. What is given up: no CI deploys, so every publish is a deliberate local command, and any Phase 1 pipeline starts with reinstalling that app. If Phase 1 wants one, that is a new decision with the command, the root directory and the branch it publishes all named | 2026-10-28 (L-6, at Ademola's direction) |

## 16. Contribution protocol

Every contribution, by a human or an agent, updates the living docs before it counts as done.

1. `ROADMAP.md`: set the status of every task you touched, add tasks you discovered, recalculate the scorecard, and add one Progress log line (date, who, what, task IDs, files). This file changes on every contribution without exception.
2. `PROJECT_STRUCTURE.md`: if you added, moved, renamed or deleted a file or folder, or changed its purpose, update the tree, the file table and the Structure change log.
3. `ARCHITECTURE.md` decision log and `ARCHITECTURE_ESSENTIALS.md`: if a decision or rule changed.
4. In your final report, say which of these you updated. A contribution is not done until they are.

Enforcement: CI fails any PR that does not change `ROADMAP.md`, and any PR that adds, deletes or renames a file without changing `PROJECT_STRUCTURE.md` (task F-7). CI checks that the files changed, not that the edits are accurate, so the PR template and review still matter. Making the check required through branch protection may need a paid GitHub plan on a private repo. [Verify]
