# ARCHITECTURE_ESSENTIALS

Quick reference for agents. If this file and ARCHITECTURE.md disagree, ARCHITECTURE.md wins and this file needs fixing. Product intent is in PRD.md. Version 0.3.

## What this is
- Booking and showcase site for Boy Concept (Alpha Movies Ltd). The enquiry flow and the credibility layer are the product.

## Build order
- Status, tasks and the current phase live in `ROADMAP.md`, not here.
- Phase 0: Astro static site, content in repo files, `EnquiryForm` island builds the WhatsApp message in the browser. No backend.
- Phase 1: add the Worker, D1, email and Turnstile. Add a hosted CMS (Sanity) only if Q13 is yes.
- Parked until triggered: availability picker, owner dashboard, event tracking, deposits.

## Stack
- Site: Astro 6, TypeScript, static output. Tailwind v4 with `web/src/styles/tokens.css` as the only token source. One Preact island: `EnquiryForm`.
- Content: Astro content collections (files) with Zod schemas.
- API: one Cloudflare Worker (Hono, Zod) that also serves the static build as assets. Same origin, no CORS.
- Data: D1. Email: Resend. Bot check: Turnstile, honeypot, rate limit per contact.
- Node 22+, npm workspaces: `web`, `worker`, `shared`.

## Boundaries
- Browser talks only to the Worker, same origin.
- The Worker is the source of truth for validation, storage, notification and the WhatsApp URL.
- `shared/` holds pure functions (`whatsapp.ts`) and `site-config.ts` (the one definition of the owner WhatsApp digits). Neither web nor worker code is imported into it.
- Only `worker/src/lib/db.ts` touches D1.

## Data (names only)
- Content collections: projects (verified, publish_ok), credentials (verified, source), settings.
- D1 `enquiry`: ref (UNIQUE), client_request_id (UNIQUE), status new/handled/spam, event_date, event_end_date, short_notice, whatsapp_e164 or email, company, project_type, duration, deliverables, reference_url, consent_at.

## API (Phase 1)
- Only `POST /api/enquiries`. Returns `{ ref, whatsappUrl }`. A repeated `clientRequestId` returns the original result.
- One error shape: `{ error: { code, fields? } }`.

## Hard rules
1. No budget field anywhere.
2. Date comes first in the form.
3. The WhatsApp handoff is a visible button (plain link). Never auto-open after an async call.
4. `wa.me` numbers are digits only: no plus, no leading zeros.
5. A backend failure never blocks the handoff. Return a valid `whatsappUrl` regardless.
6. Rate limit per phone or email plus Turnstile. Never by IP alone.
7. Submit is idempotent on `clientRequestId`, backed by a `UNIQUE` constraint.
8. Content renders only if verified and permitted. Empty sections and categories hide. No bracketed placeholders in verified items (the build guard fails).
9. Always show a direct WhatsApp link that works without JavaScript.
10. No autoplaying video iframes. Poster first, load on tap.
11. No PII in logs. No IP storage.
12. Secrets only in Worker env vars and `.dev.vars`. Every account is held by the client.
13. Every contribution updates `ROADMAP.md` (always) and `PROJECT_STRUCTURE.md` (when files or folders change) before it counts as done. State what you updated in your report.
14. UI follows `docs/DESIGN.md`: tokens only, no hardcoded colors, black page background, the logo only on black or very dark surfaces and never recolored.
15. The owner WhatsApp number is defined only in `shared/site-config.ts`.

## Env vars and bindings
- Worker: binding `DB`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `OWNER_EMAILS`, `ALLOWED_ORIGIN`.
- Web build: `PUBLIC_TURNSTILE_SITE_KEY`.

## Known breakpoints
- Single-Worker routing of assets plus `/api/*` is verified locally (S-1, `docs/spikes/stack-spike.md`): `[assets] run_worker_first = ["/api/*"]`. The deployed-to-test half is unverified. Fallback: two Workers with CORS. An asset miss falls through to the Worker, so scope the Worker catch-all to `/api/*` and set `not_found_handling` (D19).
- Turnstile and `wa.me` inside the Instagram in-app browser are untested and block the form design.
- Email deliverability from a new domain.
- `_headers` and the CSP with Worker assets are unverified.

## Cut or parked (do not build unprompted)
- Availability picker, `blocked_date`, `date_conflict`.
- Owner dashboard, `/api/events`, `wa_tapped`, IP hashing.
- Service and FAQ collections, hero loop video, short-form row.
- A hosted CMS unless Q13 is yes, a shared client-side Zod schema, a third environment, Phase 2 payments.

## Layout
- Full map in `PROJECT_STRUCTURE.md`: `/web`, `/worker`, `/shared`, `/docs`, `/assets`, `/content`, `/ops`, `/pitch`.
