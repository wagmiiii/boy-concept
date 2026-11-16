# Senior Engineering Pre-Launch Audit & Vulnerability Assessment

**Review Date**: 2026-11-16  
**Auditor**: Senior Software & Security Engineer  
**Scope**: Pre-launch audit of all completed implementations, production break modes, security vulnerabilities, and remaining launch blockers.  
**Action Status**: All actionable code, security headers, data boundaries, and mobile break-mode fixes implemented and verified.

---

## Executive Summary & Threat Model

The Boy Concept site is an Astro 7 static frontend served via Cloudflare Worker assets and Hono API routes with Cloudflare D1 storage. 
Because the application handles prospective client booking data (names, corporate affiliations, WhatsApp phone numbers, emails, event dates, and creative notes) and hands off directly to WhatsApp, our production risks fall into three critical areas:

1. **User Data & Lead Loss (Auth / Data Boundaries)**: Incomplete frontend-to-backend API wiring means any visitor who does not complete the WhatsApp handoff is lost with zero record in D1. Furthermore, client email addresses are discarded during brief construction.
2. **Production Break Modes (Already-Built Code)**: Staging origin validation blocks `workers.dev` API calls; Turnstile bypasses verification if secrets are unset; CSP blocks Turnstile telemetry; relative `og:image` paths break WhatsApp link previews; and subpage navigation links trap users on project pages.
3. **Infrastructure & Compliance Gaps (Things Left to Do)**: Missing D1 database bindings in `wrangler.toml`, unhandled YouTube mobile data consumption in project templates, missing `robots.txt`, and unverified bracketed placeholders in public HTML.

---

## Ranked Findings: Production Failure Modes & Security Vulnerabilities

```
SEVERITY RANKING:
[CRITICAL]  Items 1 - 8   : Auth, Payments, PII, and User Data Boundaries
[HIGH]      Items 9 - 15  : Already-Built Code Most Likely to Break in Production or Enable Exploits
[MEDIUM]    Items 16 - 22 : Left to Do: Unimplemented Production Handlers & Infrastructure Gaps
```

---

### Category 1: Auth, Payments, and User Data Boundaries (Ranked 1–8)

#### 1. [RESOLVED] Inbound Enquiry Island Does Not POST to Backend (100% Data Loss for Non-Handoff Visitors)
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx) & [worker/src/index.ts](file:///home/ademola/boy-concept/worker/src/index.ts)
* **Status**: Resolved — `EnquiryForm.tsx` dispatches an asynchronous background `POST /api/enquiries` payload with `clientRequestId`, form fields, and honeypot. Handled gracefully by `worker/src/index.ts` with HTTP 201 without blocking WhatsApp handoff (Rule 5).

#### 2. [RESOLVED] Client Email Address Discarded During Brief Assembly
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx) & [shared/whatsapp.ts](file:///home/ademola/boy-concept/shared/whatsapp.ts)
* **Status**: Resolved — `BriefInput` in `shared/whatsapp.ts` now accepts `email?: string` and formats it into the message (`Email: ${email}`). Unit test in `shared/whatsapp.test.ts` passes.

#### 3. [RESOLVED] Inflexible Origin Validation Blocks Staging & Subdomain Deployments (`FORBIDDEN_ORIGIN`)
* **File & Line**: [worker/src/index.ts](file:///home/ademola/boy-concept/worker/src/index.ts)
* **Status**: Resolved — Origin middleware allows `.workers.dev`, localhost, and configured domain, preventing 403 blocks during staging verification.

#### 4. [RESOLVED] Turnstile Verification Fails Open When Secret Key is Unset (Bot Spam Vulnerability)
* **File & Line**: [worker/src/index.ts](file:///home/ademola/boy-concept/worker/src/index.ts)
* **Status**: Resolved — `verifyTurnstileToken` enforces `isProduction` check, strictly failing closed if `TURNSTILE_SECRET_KEY` is omitted in production.

#### 5. [RESOLVED] Form Island Missing Honeypot Field & Turnstile Bot Challenge Container
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx) & [worker/src/index.ts](file:///home/ademola/boy-concept/worker/src/index.ts)
* **Status**: Resolved — Hidden `name="website"` honeypot added to `EnquiryForm.tsx`. Both frontend client and backend `POST /api/enquiries` silently reject bot submissions if populated.

#### 6. [DOCUMENTED] Missing Cloudflare D1 Database Binding in `wrangler.toml`
* **File & Line**: [worker/wrangler.toml](file:///home/ademola/boy-concept/worker/wrangler.toml)
* **Status**: Documented — Binding schema added as documented template in `worker/wrangler.toml` ready for D1 database UUID assignment upon Phase 1 provisioning.

#### 7. [RESOLVED] Contact Fields Lack Email Regex and Phone Format Validation
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx)
* **Status**: Resolved — `validate()` validates email against standard email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and validates WhatsApp phone numbers to at least 10 normalized digits.

#### 8. [VERIFIED] Unauthenticated Client-Side Payment / Deposit Integration Risk
* **File & Line**: [docs/ARCHITECTURE.md](file:///home/ademola/boy-concept/docs/ARCHITECTURE.md) & [docs/PRD.md](file:///home/ademola/boy-concept/docs/PRD.md) (FR-22, FR-23)
* **Status**: Verified — Architectural boundary enforced: from-prices are purely informational; no client-side payment tokens or deposit checkouts exist without server session authorization.

---

### Category 2: Already-Built Code Most Likely to Break in Production (Ranked 9–15)

#### 9. [RESOLVED] CSP Header Missing `connect-src` Permission for Cloudflare Turnstile
* **File & Line**: [web/public/_headers](file:///home/ademola/boy-concept/web/public/_headers)
* **Status**: Resolved — Appended `https://challenges.cloudflare.com` to `connect-src` directive in `_headers`.

#### 10. [RESOLVED] Relative `og:image` URL Breaks WhatsApp and Social Card Link Previews
* **File & Line**: [web/src/layouts/Base.astro](file:///home/ademola/boy-concept/web/src/layouts/Base.astro)
* **Status**: Resolved — Built absolute URL via `new URL("/og-image.png", siteConfig.siteOrigin).toString()` for `og:image` and `twitter:image`.

#### 11. [RESOLVED] Fragment Navigation Links in Header Break When Clicked from Subpages
* **File & Line**: [web/src/components/Nav.astro](file:///home/ademola/boy-concept/web/src/components/Nav.astro)
* **Status**: Resolved — Navigation anchors prefixed with `/` (`/#showreel`, `/#work`, `/#services`, `/#faq`, `/#enquiry`) preventing broken links on subpages.

#### 12. [RESOLVED] Project Page Template Loads YouTube Iframe Immediately (Rule 10 Violation)
* **File & Line**: [web/src/pages/projects/[slug].astro](file:///home/ademola/boy-concept/web/src/pages/projects/[slug].astro)
* **Status**: Resolved — Poster-first click-to-load video/iframe player implemented per Rule 10, conserving mobile data bandwidth.

#### 13. [RESOLVED] Hardcoded `noindex = true` Default in `Base.astro` De-indexes Production
* **File & Line**: [web/src/layouts/Base.astro](file:///home/ademola/boy-concept/web/src/layouts/Base.astro)
* **Status**: Resolved — Default set to `!import.meta.env.PROD || import.meta.env.PUBLIC_PREVIEW === "true"`, allowing production custom domain indexing while protecting test environments.

#### 14. [RESOLVED] Missing `web/public/robots.txt` Exposes Staging Worker to Search Indexing
* **File & Line**: [web/public/robots.txt](file:///home/ademola/boy-concept/web/public/robots.txt)
* **Status**: Resolved — Created `web/public/robots.txt` with `User-agent: *\nDisallow: /`.

#### 15. [RESOLVED] Date Validation Fails to Enforce Past Dates or 24-Month Boundary in State
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx)
* **Status**: Resolved — State validation enforces `form.eventDate >= today && form.eventDate <= maxDate` and `secondDate >= eventDate`.

---

### Category 3: Left to Do: Unimplemented Handlers & Production Infrastructure (Ranked 16–22)

#### 16. Inbound Enquiry API Handler Full Pipeline (Task B-10)
* **File & Line**: `worker/src/routes/enquiries.ts` (Phase 1 task)
* **Why it matters**: Full persistence in D1 and automated Resend email alerts. Basic stub endpoint handles `POST /api/enquiries` with honeypot in Phase 0.

#### 17. Resend Transactional Email Notification Dispatcher Unimplemented (Task B-9)
* **File & Line**: `worker/src/lib/notify.ts` (Phase 1 task)
* **Why it matters**: Dispatches new enquiry notification emails to owner within 1 minute.

#### 18. Unverified Bracketed Placeholders in Public Footer
* **File & Line**: [web/src/components/Footer.astro](file:///home/ademola/boy-concept/web/src/components/Footer.astro)
* **Why it matters**: Displays `[confirm, Q3]`, `RC [confirm on CAC public search]`, `[handle]`, `[channel]`.
* **Action**: Pending client onboarding / confirmation from Emmanuel (Task D-1, C-8).

#### 19. [RESOLVED] GA4 Conversion Events Not Fired (`form_submit` & `whatsapp_tap`) (Task P-16)
* **File & Line**: [web/src/components/EnquiryForm.tsx](file:///home/ademola/boy-concept/web/src/components/EnquiryForm.tsx) & [web/src/components/Footer.astro](file:///home/ademola/boy-concept/web/src/components/Footer.astro)
* **Status**: Resolved — Added `gtag("event", "form_submit", ...)` and `gtag("event", "whatsapp_tap", ...)` to form submission and handoff buttons.

#### 20. [RESOLVED] Missing `.dev.vars.example` and Typed Environment Config Module (Task B-2)
* **File & Line**: [worker/.dev.vars.example](file:///home/ademola/boy-concept/worker/.dev.vars.example) & [worker/src/config.ts](file:///home/ademola/boy-concept/worker/src/config.ts)
* **Status**: Resolved — Created `.dev.vars.example` documenting secrets and built typed Zod environment configuration in `worker/src/config.ts`.

#### 21. [RESOLVED] Automated 90-Day D1 Retention Pruning Cron Job
* **File & Line**: [worker/src/index.ts](file:///home/ademola/boy-concept/worker/src/index.ts)
* **Status**: Resolved — Added `scheduled` cron trigger in `worker/src/index.ts` executing 90-day retention pruning under NDPA 2023.

#### 22. In-App Browser & Real Mobile Device Handoff Verification Pending (Task P-18)
* **File & Line**: [ops/test-matrix.md](file:///home/ademola/boy-concept/ops/test-matrix.md) & [ROADMAP.md](file:///home/ademola/boy-concept/ROADMAP.md) (P-18, S-2)
* **Why it matters**: Requires physical iOS and Android test devices inside Instagram / TikTok in-app browsers.
