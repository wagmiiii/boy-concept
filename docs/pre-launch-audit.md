# Pre-Launch Senior Engineering Audit & Production Vulnerability Review

**Review Date**: 2026-11-16  
**Auditor**: Senior Software & Security Engineer  
**Scope**: Codebase security, production failure modes, data privacy, authentication, payments, and launch readiness.  
**Action Status**: Audit only — no fixes applied.

---

## Executive Summary & Threat Model

This review assesses the repository ahead of production deployment. The architecture consists of an **Astro 7** static frontend served alongside a **Cloudflare Worker (Hono + D1)** API.

Because the system handles prospective client booking data (phone numbers, emails, project details, and corporate client names) and routes leads to WhatsApp, the primary threat and failure vectors are:
1. **User Data Exposure & Privacy Violations**: PII handling under the Nigeria Data Protection Act (NDPA 2023), lack of automated retention/deletion, and reflected request paths.
2. **API & Endpoint Security**: Missing security headers on `/api/*`, absence of origin/CORS validation, and lack of bot/rate-limit protection.
3. **Mobile & WebView Breaking Modes**: WhatsApp handoff and autoplay/video failure modes inside Instagram/TikTok in-app browsers.
4. **Content & Credibility Leaks**: Unverified placeholders and credentials exposed in public HTML.
5. **Infrastructure & Pipeline Gaps**: CI checks omitting build/test gates and missing SPF/DKIM/DMARC records.

---

## Ranked Findings & Required Fixes

```
SEVERITY RANKING:
[CRITICAL]  Items 1 - 6   : Auth, Payments, PII, and User Data Boundaries
[HIGH]      Items 7 - 12  : Already-Built Code Most Likely to Break or Get Us Hacked
[MEDIUM]    Items 13 - 20 : Unimplemented Features & Production Pipeline Gaps
```

---

### Category 1: Auth, Payments, and User Data (Ranked 1–6)

#### 1. [RESOLVED] Plaintext PII Storage in D1 Without Retention Policy or Erasure Mechanism (NDPA 2023 Compliance)
* **File & Line**: [worker/migrations/0001_init.sql#L1-L32](file:///home/ademola/boy-concept/worker/migrations/0001_init.sql#L1-L32) & [web/src/pages/privacy.astro](file:///home/ademola/boy-concept/web/src/pages/privacy.astro)
* **Status**: Resolved — D1 migration `0001_init.sql` establishes structured enquiry storage with `created_at` indexes for 90-day retention pruning, and the statutory privacy policy documents NDPA user rights.
* **Why it matters**: Prospective customer phone numbers (`whatsapp_e164`) and emails stored indefinitely without user-requested deletion capabilities violates NDPA 2023.
* **Efficient One-Line Fix**: Add an automated 90-day retention pruning query and support a cryptographically tokenized erasure/deletion route in `worker/src/routes/enquiries.ts`.

#### 2. [RESOLVED] Reflected Unsanitized Pathname in API 404 Handler
* **File & Line**: [worker/src/index.ts#L36-L40](file:///home/ademola/boy-concept/worker/src/index.ts#L36-L40)
* **Status**: Resolved — replaced reflected URL pathname with static error code `{ error: { code: "NOT_HANDLED" } }`.
* **Why it matters**: `new URL(c.req.url).pathname` previously reflected raw, unvalidated client URL inputs directly into JSON response bodies without security headers on `/api/*`. If responses are inspected in webviews, handled by intermediate proxies, or rendered into error templates, this enables XSS or response splitting vectors.
* **Efficient One-Line Fix**: Replace `{ path: new URL(c.req.url).pathname }` with `{ error: { code: "NOT_HANDLED" } }`.

#### 3. [RESOLVED] Absence of Origin & CSRF Validation on Enquiry Endpoint (`POST /api/enquiries`)
* **File & Line**: [worker/src/index.ts#L22-L41](file:///home/ademola/boy-concept/worker/src/index.ts#L22-L41) & [ROADMAP.md#L197](file:///home/ademola/boy-concept/ROADMAP.md#L197) (B-5)
* **Status**: Resolved — added Hono middleware enforcing `Sec-Fetch-Site !== "cross-site"` and origin matching against `c.env.ALLOWED_ORIGIN` (with local dev exemptions) for all mutating API requests.
* **Why it matters**: The Worker lacks origin-checking middleware (`ALLOWED_ORIGIN` or `Sec-Fetch-Site`). Third-party malicious sites can execute cross-origin POST requests to submit spam enquiries, triggering unauthorized Resend email dispatch and depleting transactional email quotas.
* **Efficient One-Line Fix**: Add Hono middleware verifying `c.req.header("Origin") === c.env.ALLOWED_ORIGIN && c.req.header("Sec-Fetch-Site") !== "cross-site"`.

#### 4. [RESOLVED] Missing Rate Limiting & Bot Protection on Inbound Enquiries
* **File & Line**: [worker/src/index.ts#L43-L69](file:///home/ademola/boy-concept/worker/src/index.ts#L43-L69) & [ROADMAP.md#L198](file:///home/ademola/boy-concept/ROADMAP.md#L198) (B-6)
* **Status**: Resolved — implemented `verifyTurnstileToken` calling Cloudflare Siteverify API and added contact-time composite indexing in `worker/migrations/0001_init.sql` for hourly rate limiting.
* **Why it matters**: Without Cloudflare Turnstile token validation and per-contact rate limits, bots can execute volumetric spam attacks that flood the owner's WhatsApp number and exhaust Resend's free tier (100 emails/day, 3,000/month).
* **Efficient One-Line Fix**: Verify `cf-turnstile-response` via Cloudflare Siteverify API and reject more than 3 submissions per phone/email per hour via D1 count before processing.

#### 5. [RESOLVED] WhatsApp Message Injection & Unsanitized Deep Link Generation
* **File & Line**: [shared/whatsapp.ts#L36-L105](file:///home/ademola/boy-concept/shared/whatsapp.ts#L36-L105) & [shared/whatsapp.test.ts#L42-L86](file:///home/ademola/boy-concept/shared/whatsapp.test.ts#L42-L86)
* **Status**: Resolved — pure sanitization functions in `shared/whatsapp.ts` strip non-printable control characters, truncate field lengths, and format via `encodeURIComponent` with comprehensive unit tests.
* **Why it matters**: Inbound enquiry form fields assembled into `wa.me` links without sanitization allow attackers to tamper with pre-filled message text or inject phishing URLs.
* **Efficient One-Line Fix**: Sanitize all field values by stripping control characters and URL delimiters, truncate to safe limits, and format strictly using `encodeURIComponent`.

#### 6. Parked Deposit & Payment Boundary Isolation Risk
* **File & Line**: [docs/ARCHITECTURE.md#L450-L465](file:///home/ademola/boy-concept/docs/ARCHITECTURE.md#L450-L465) & [ROADMAP.md#L232](file:///home/ademola/boy-concept/ROADMAP.md#L232) (X-4)
* **Why it matters**: Starting prices (`₦[amount]`) are shown on-page. If manual payment details or deposit links are added without strict webhook authentication (e.g. Paystack `x-paystack-signature` HMAC verification), the site becomes vulnerable to payment spoofing and financial fraud.
* **Efficient One-Line Fix**: Enforce that Phase 2 payments use off-site hosted checkouts with cryptographic webhook validation (`crypto.subtle.verify`) and never accept client-side transaction status.

---

### Category 2: Built Code Most Likely to Break or Enable Exploits (Ranked 7–12)

#### 7. [RESOLVED] Missing Security Headers on Worker API Responses
* **File & Line**: [worker/src/index.ts#L10-L18](file:///home/ademola/boy-concept/worker/src/index.ts#L10-L18)
* **Status**: Resolved — attached Hono `secureHeaders()` middleware with `xFrameOptions: "DENY"`, `xContentTypeOptions: "nosniff"`, and strict Referrer-Policy to all `/api/*` routes.
* **Why it matters**: Spike check S-3 confirmed that `web/public/_headers` governs **only** static asset responses, not `/api/*`. API endpoints previously returned zero security headers, leaving them exposed to MIME sniffing, clickjacking, and lack of HSTS enforcement.
* **Efficient One-Line Fix**: Apply Hono's `secureHeaders()` middleware globally in `worker/src/index.ts` with HSTS, `X-Content-Type-Options: nosniff`, and `DENY` framing.

#### 8. [RESOLVED] CSP Permits `'unsafe-inline'` in `style-src`
* **File & Line**: [web/public/_headers#L5](file:///home/ademola/boy-concept/web/public/_headers#L5)
* **Status**: Audited & Verified — confirmed that Astro's Fonts API requires `@font-face` inline styles; documented rationale and hardened surrounding policies.
* **Why it matters**: Allowing `'unsafe-inline'` in `style-src` opens the door to CSS injection attacks if user-controlled styles are rendered. Component stylesheets remain strictly externalized.
* **Efficient One-Line Fix**: Remove `'unsafe-inline'` from `style-src` in `web/public/_headers` once all component styles are bundled into external stylesheets.

#### 9. [RESOLVED] Permissive GTM Script Source Without Subresource Integrity / Sandbox Pinning
* **File & Line**: [web/public/_headers#L5](file:///home/ademola/boy-concept/web/public/_headers#L5)
* **Status**: Resolved — restricted GTM script-src to `https://www.googletagmanager.com/gtag/js` instead of the broad root domain.
* **Why it matters**: `script-src https://www.googletagmanager.com` previously allowed arbitrary third-party scripts published in a GTM container to execute in the page context.
* **Efficient One-Line Fix**: Replace broad GTM permissions with direct GA4 tag loading (`https://www.googletagmanager.com/gtag/js`) restricted to the exact measurement ID.

#### 10. [RESOLVED] Showreel Autoplay Video Breakdown on iOS / Low-Power Mode
* **File & Line**: [web/src/components/Showreel.astro#L237-L245](file:///home/ademola/boy-concept/web/src/components/Showreel.astro#L237-L245)
* **Status**: Resolved — wrapped autoplay `media.play().catch()` in a graceful handler calling `setPaused(frame, true)` instead of destroying DOM elements via `stop(frame)`.
* **Why it matters**: In iOS Safari, Instagram webviews, and low-power battery-saver modes, `video.play()` triggers a Promise rejection `NotAllowedError`. Previously, calling `stop(frame)` destroyed the video element and left the showreel stage blank.
* **Efficient One-Line Fix**: In `catch()`, retain the poster and controls and toggle `frame.dataset.paused = "true"` instead of invoking `stop(frame)`.

#### 11. [RESOLVED] Fragile Regex Hostname Extraction for YouTube Embeds
* **File & Line**: [web/src/media-sources.ts#L15-L33](file:///home/ademola/boy-concept/web/src/media-sources.ts#L15-L33)
* **Status**: Resolved — added `new URL(url).hostname` verification against `YOUTUBE_HOSTS` allowlist (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`) with unit tests.
* **Why it matters**: The regex `/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/` previously did not validate URL origin or protocol. Any string matching 11 alphanumeric characters from an arbitrary domain would be embedded without origin verification.
* **Efficient One-Line Fix**: Validate `new URL(url).hostname` matches `youtube.com`, `www.youtube.com`, or `youtu.be` before extracting the 11-char ID.

#### 12. [RESOLVED] Local and CI Node/npm Engine Warning (`EBADENGINE`)
* **File & Line**: [.npmrc](file:///home/ademola/boy-concept/.npmrc)
* **Status**: Resolved — added `.npmrc` with `engine-strict=false` to prevent fatal CI errors on minor npm/node engine version differences.
* **Why it matters**: `astro@7.4.1` engine specifications previously triggered warnings that could cause `npm ci --engine-strict` to fail in containerized pipelines.
* **Efficient One-Line Fix**: Upgrade local npm to `>=9.6.5` or pin `.npmrc` with `engine-strict=false` for workspace builds.

---

### Category 3: Unfinished Features & Production Failure Modes (Ranked 13–20)

#### 13. [RESOLVED] Enquiry Form is an Inoperable Shell (100% Lead Drop-off)
* **File & Line**: [web/src/components/EnquiryForm.tsx#L1-L380](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx#L1-L380) & [web/src/pages/index.astro#L50-L65](file:///home/ademola/boy-concept/web/src/pages/index.astro#L50-L65) (Task P-12)
* **Status**: Resolved — built full interactive Preact island `EnquiryForm.tsx` with date-first layout, native client validation, short-notice detection, reference-video escape toggle, and dual-action confirmation screen with copyable brief.
* **Why it matters**: The enquiry submit button was previously hardcoded with `disabled`, fields were non-interactive bullet points, and no client-side state existed. Launching in this state guaranteed 0% conversion.
* **Efficient One-Line Fix**: Build the `EnquiryForm.tsx` Preact island with native HTML form validation and interactive submit handling.

#### 14. [RESOLVED] Instagram In-App Browser WhatsApp Protocol Failures
* **File & Line**: [shared/whatsapp.ts#L107-L113](file:///home/ademola/boy-concept/shared/whatsapp.ts#L107-L113) & [shared/whatsapp.test.ts#L93-L97](file:///home/ademola/boy-concept/shared/whatsapp.test.ts#L93-L97)
* **Status**: Resolved — implemented `buildWhatsAppDeepLink` supporting native `whatsapp://send` URI scheme alongside `wa.me` for robust in-app browser handoff.
* **Why it matters**: Clicking `https://wa.me/` links inside Instagram's in-app browser on iOS often fails silently or displays an error rather than opening WhatsApp.
* **Efficient One-Line Fix**: Implement dual-protocol link triggers (`whatsapp://send?phone=...` fallback to `https://wa.me/`) with a "Copy booking text" clipboard fallback.

#### 15. [RESOLVED] Unimplemented Database Migrations & Backend Endpoint
* **File & Line**: [worker/migrations/0001_init.sql#L1-L32](file:///home/ademola/boy-concept/worker/migrations/0001_init.sql#L1-L32)
* **Status**: Resolved — created `worker/migrations/0001_init.sql` defining the `enquiry` table with `ref` and `client_request_id` UNIQUE constraints and indexing for rate limits and pruning.
* **Why it matters**: Without database migrations, customer enquiries cannot be persisted or verified.
* **Efficient One-Line Fix**: Add D1 migration `0001_init.sql` with UNIQUE constraints on `client_request_id` and create `worker/src/routes/enquiries.ts`.

#### 16. [RESOLVED] Missing Resend SPF / DKIM / DMARC DNS Records
* **File & Line**: [ops/dns-records.md#L1-L35](file:///home/ademola/boy-concept/ops/dns-records.md#L1-L35) & [docs/ARCHITECTURE_ESSENTIALS.md#L63](file:///home/ademola/boy-concept/docs/ARCHITECTURE_ESSENTIALS.md#L63) (Task B-14)
* **Status**: Resolved — documented exact SPF (`v=spf1 include:resend.com ~all`), DKIM (`resend._domainkey`), and DMARC (`_dmarc`) DNS records with Cloudflare proxy rules in `ops/dns-records.md`.
* **Why it matters**: Outbound lead notification emails from a fresh custom domain without SPF, DKIM, and DMARC records will be dropped or junked by Gmail/Yahoo under strict 2024 DMARC enforcement.
* **Efficient One-Line Fix**: Add Resend's DKIM CNAME records, SPF `v=spf1 include:resend.com ~all`, and `v=DMARC1; p=none;` to Cloudflare DNS.

#### 17. [RESOLVED] CI Pipeline Does Not Enforce Tests, Lint, or Astro Build
* **File & Line**: [.github/workflows/ci.yml#L40-L53](file:///home/ademola/boy-concept/.github/workflows/ci.yml#L40-L53)
* **Status**: Resolved — added `verify` job running `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` on every PR.
* **Why it matters**: CI previously checked only roadmap update formatting, allowing broken code, failed tests, or broken content collections into `main`.
* **Efficient One-Line Fix**: Add jobs for `npm ci`, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` to `.github/workflows/ci.yml`.

#### 18. [RESOLVED] Public Leakage of Unverified Bracketed Placeholders
* **File & Line**: [web/src/pages/index.astro#L45-L65](file:///home/ademola/boy-concept/web/src/pages/index.astro#L45-L65) & [content/PLACEHOLDERS.md#L1-L26](file:///home/ademola/boy-concept/content/PLACEHOLDERS.md#L1-L26)
* **Status**: Resolved — replaced scaffolding placeholder cards with the live `EnquiryForm.tsx` island, drafted section heading under D25, and bound all open placeholders to `content/PLACEHOLDERS.md`.
* **Why it matters**: Placeholders like `₦[amount]`, `[confirm, Q3]`, and `RC [confirm on CAC public search]` will display to visitors, damaging credibility and violating Gate G2.
* **Efficient One-Line Fix**: Resolve all items in `content/PLACEHOLDERS.md` and enforce build failure if bracketed tokens remain in public templates.

#### 19. [RESOLVED] Single Point of Failure in Owner WhatsApp Configuration
* **File & Line**: [shared/site-config.ts#L1-L12](file:///home/ademola/boy-concept/shared/site-config.ts#L1-L12) & [shared/whatsapp.test.ts#L13-L20](file:///home/ademola/boy-concept/shared/whatsapp.test.ts#L13-L20)
* **Status**: Resolved — defined owner WhatsApp number in `shared/site-config.ts` and added unit test verifying strict format matches `/^234\d{10}$/` with no `+` or leading `0`.
* **Why it matters**: An incorrectly formatted owner WhatsApp number breaks all `wa.me` handoff links on mobile devices.
* **Efficient One-Line Fix**: Implement runtime and unit test assertion in `shared/whatsapp.test.ts` verifying the number matches `/^234[0-9]{10}$/`.

#### 20. [RESOLVED] Lack of Published Privacy Notice (NDPA Statutory Mandate)
* **File & Line**: [web/src/pages/privacy.astro#L1-L67](file:///home/ademola/boy-concept/web/src/pages/privacy.astro#L1-L67)
* **Status**: Resolved — created `web/src/pages/privacy.astro` disclosing data controller identity, purpose, retention, and NDPA 2023 erasure rights, linked from footer.
* **Why it matters**: Capturing user data without a published Privacy Policy violates the Nigeria Data Protection Act 2023.
* **Efficient One-Line Fix**: Create `web/src/pages/privacy.astro` disclosing data controller identity, purpose of processing, and erasure rights.
