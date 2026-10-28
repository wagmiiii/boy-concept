# Stack spike

Status: S-1 and S-5 verified, locally and on the edge. S-3 is half answered: `_headers` and the CSP are verified, the free-tier limits check is open. S-2 open, so gate G1 is still open. P-1 re-verified the routing and the header scope on the Astro 7 build. P-2 closed the D19 remedy: asset misses now serve `404.html` with the `_headers` policy, and `/api/*` still reaches the Worker.
Environment for S-1, S-5 and S-3: Ubuntu x64, Node v22.23.2, npm 10.9.8, wrangler 4.153.0, astro 6.4.8, hono 4.13.14, zod 4.6.7. Runs on 2026-10-27 by Agent (Qoder).
Environment for the P-1 re-check below: the same machine, astro 7.4.1, vite 8.3.5, @astrojs/preact 6.1.0, preact 11.0.2, tailwindcss 4.3.3, eslint 10.13.0, vitest 5.0.5.

## S-1: one Worker serves the Astro build and routes /api/* to Hono

### Setup that was tested

`worker/wrangler.toml`:

```toml
[assets]
directory = "../web/dist"
binding = "ASSETS"
run_worker_first = ["/api/*"]
```

`web` built with `output: "static"` and one page. Hono app exposes `GET /api/ping`, `POST /api/spike` (Zod-validated) and a catch-all `app.all("*")` returning JSON.

Run: `npm run build` then `npx wrangler dev --ip 127.0.0.1 --port 8788`. Local mode, no Cloudflare account required.

### Results

| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | `GET /` serves the built asset | pass | 200, `text/html`, 243 bytes, contains the page heading |
| A2 | `GET /api/ping` reaches Hono, not assets | pass | 200, `application/json`, `{"ok":true,"from":"hono",...}` |
| A3 | `POST /api/spike` with a valid body | pass | 200, Zod parse succeeded |
| A4 | `POST /api/spike` with an invalid body | pass | 400, `{"error":{"code":"VALIDATION"}}` |
| A5 | `GET /api/nope` unmatched API path | pass | 404 JSON from the Worker catch-all |
| A6 | `GET /missing.html` (no such asset) | **gotcha** | 404 but the body is the Worker's JSON catch-all, not an HTML 404 |
| A7 | `POST /` (non-API) | info | 405, empty body. Assets accept only GET/HEAD, so a POST outside `/api/*` never reaches Hono |
| A8 | `GET /index.html` | info | 307 redirect to `/`. Assets serve clean URLs, so `.html` links redirect |
| A9 | Response headers on `/` | info | ETag, `Cache-Control: public, max-age=0, must-revalidate`, `CF-Cache-Status: HIT`. No CSP, `_headers` was not tested (S-3) |

`npm run typecheck` (`astro check` plus `tsc --noEmit`): 0 errors, 0 warnings.

### Verdict

**The single-Worker design works locally, and the same checks pass against the deployed Worker (see the S-5 section below).** `run_worker_first = ["/api/*"]` is the mechanism: it routes only `/api/*` to Hono and lets assets answer everything else. Same origin, no CORS. Decision D17 holds. The two-Worker fallback is not needed for this part.

### What A6 changes for the build

An asset miss falls through to the Worker even without `run_worker_first`. A broad `app.all("*")` therefore turns every missing page into a JSON 404, which is wrong for a browser and wrong for crawlers. Two things to do at B-1:

1. Set `not_found_handling` in the `[assets]` block, and ship a real `404.astro` at P-2 so Astro emits `404.html`. **Done at P-2, re-probed below: the assets layer now answers a miss with the HTML page and status 404, and the Worker never sees it.**
2. Scope the Worker catch-all to `/api/*` instead of `*`, so an unmatched API path gets the one error shape and nothing else does.

A8 is not a problem, but it means `site` in `astro.config.mjs` must be set to the final origin at L-2 so canonical and OG URLs use the extensionless form.

## S-5: the deployed half, attempted and blocked 2026-10-27

Credentials were kept outside the repo (`~/.cfspike`, mode 600). No token value and no account ID belongs in this repo, which is public.

| Step | Result |
|---|---|
| `wrangler whoami` with an Account API token | pass (Certain). The token authenticates against the account |
| `npm run build` | pass |
| `npx wrangler deploy` | refused: "You need to register a workers.dev subdomain before publishing to workers.dev". Wrangler asked interactively and, with no TTY, used the fallback answer `no` |
| `POST /accounts/<id>/workers/subdomain` using the token | `10405 Method not allowed for this authentication scheme`. An Account API token cannot create the subdomain (Certain) |
| `GET` on the same path | `10007 You do not have a workers.dev subdomain ... Opening the Workers & Pages landing page for the first time will create a workers.dev subdomain automatically` |
| `npx wrangler dev --remote` (edge sandbox, nothing published) | also refused: `.../workers/scripts/boy-concept-spike/subdomain/edge-preview` needs a registered subdomain |
| `user/tokens/verify` | `success: false`, expected: that endpoint is for User tokens, and this is an Account token. Not a permission problem |

Two conclusions at the time:

1. **No agent-reachable path completed S-5 until a human visited the Cloudflare dashboard once.** The agreed subdomain name was `boy-concept`, chosen deliberately because it is account-wide and names every future preview URL.
2. **P-20 and B-15 inherit this prerequisite.** Whoever runs the first real test deploy needs the account already set up.

The attempt published nothing and changed nothing in the account.

## S-5 resolved the same day: the deployed half is verified

Ademola went through the Workers and Pages onboarding and connected the GitHub repo, which registered the subdomain and produced a build that failed for a separate, real reason.

**Outcome, all Certain, from the live Worker at `https://boy-concept-spike.ademola2993k.workers.dev`:**

| # | Check | Local | Deployed |
|---|---|---|---|
| A1 | `GET /` serves the built asset | pass | pass, 200, `text/html`, 243 bytes |
| A2 | `GET /api/ping` reaches Hono | pass | pass, 200, JSON |
| A3 | `POST /api/spike` valid | pass | pass, 200 |
| A4 | `POST /api/spike` invalid | pass | 400, `{"error":{"code":"VALIDATION"}}` |
| A5 | `GET /api/nope` | pass | 404 JSON from the Worker |
| A6 | `GET /missing.html` | gotcha | same gotcha at the edge, JSON body (D19) |
| A7 | `POST /` | 405 | 405 |
| A8 | `GET /index.html` | 307 | 307 to `/` |
| A9 | Headers on `/` | ETag and cache-control | `cache-control: public, max-age=0, must-revalidate`, `cf-cache-status: HIT`, HTTP/2, **no ETag**, and no CSP, because no `_headers` file exists yet (S-3, B-11) |
| A10 | `GET /projects/some-project` | not run | 404. Clean-URL deep paths behave the same as `/missing.html`, so D19 covers them |

Worker startup time 14 ms. Bundle: 826 KiB raw, 134 KiB gzipped, which is mostly Zod; worth watching against the bundle limit in S-3.

**S-1 and D17 are now verified end to end on Cloudflare's edge, not only locally.** A real browser request to `/api/*` reaches Hono and every other path is served from the Astro build, same origin, no CORS. The two-Worker fallback is not needed.

### The repo bug that the dashboard build found

`npx wrangler deploy` from the repository root fails: *"The Cloudflare application detection logic has been run in the root of a workspace instead of targeting a specific project."* Cloudflare's CI runs the deploy command at the root, so this would have blocked every automated deploy. Fixed by adding the root script AGENTS.md always promised:

```
"deploy:test": "npm run build && wrangler deploy --config worker/wrangler.toml"
```

`--config` also resolves `[assets] directory = "../web/dist"` relative to the config file, which is what makes it work from anywhere. Verified with `--dry-run` first, then a real deploy.

### Account state worth knowing

- The subdomain registered itself as `ademola2993k`, not the agreed `boy-concept`. Cloudflare chose it during onboarding. Renaming it in the dashboard changes every preview URL, including this spike's, so the name in this doc goes stale if he renames it.
- The dashboard held a GitHub build integration for this repo whose deploy command was `npx wrangler deploy`, which failed from the workspace root on every push. L-6 closed it on 2026-10-28 by deleting the Worker it was keyed to, the hello-world stub onboarding created and this repo never deployed. The failing check is gone and `npm run deploy:test` is the only pipeline; D30 records why disconnecting beat rewiring.
- The spike Worker `boy-concept-spike` is live and public. It serves one noindex page and a stub API, and holds no data. Delete it in the dashboard when S-4 closes, or leave it as the deploy target for P-20.
- Rotate the Cloudflare API token used here: it was shared in plain text outside a secret store. It lives only in `~/.cfspike` (mode 600), never in the repo.

## S-3, part 1: do `_headers` and the CSP work with Worker assets? Yes

Answered 2026-10-27 on the deployed spike Worker. This closes ARCHITECTURE Verify item 5 and unblocks the B-11 design.

Setup: `web/public/_headers` with a `/*` block carrying a CSP plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and HSTS. Astro copies `public/*` into `dist/`, and the deploy uploads the file. `/_headers` itself is not fetchable (404), which is correct.

| Probe | `_headers` applied? | What it means |
|---|---|---|
| `GET /` (asset) | **yes**, all six headers present | The assets layer evaluates `_headers`, so static pages are covered |
| `GET /index.html` (307 from assets) | **yes**, on the redirect too | Asset-generated redirects inherit the block |
| `GET /api/ping` (Hono) | **no**, not one header | Worker responses bypass `_headers` entirely |
| `POST /api/spike` (Hono) | **no** | Same |
| `GET /missing.html` (asset miss, falls through to the Worker) | **no** | A miss becomes a Worker response, so it loses the policy. D19 again |
| `GET /projects/x` (deep path miss) | **no** | Same shape |

Local parity was checked too: `wrangler dev` applies the same `_headers` block on `GET /`, so there is no local-versus-edge divergence waiting for B-11. A header mistake shows up in dev.

### What this decides for B-11

1. `web/public/_headers` stays as the mechanism for pages. No `_headers`-to-Worker port needed, and no `run_worker_first = true` for the sake of headers, which would have put every asset request through the Worker and burned invocation quota.
2. **The Worker must set its own security headers on `/api/*`** in Hono middleware. Today an API response carries no `X-Content-Type-Options` and no CSP. A JSON API is a lower risk, but nosniff and `frame-ancestors` are cheap; B-11 now covers both files.
3. **B-11 also has to re-test the miss path** once `not_found_handling` and `404.astro` exist. If the assets layer produces the 404 page, `_headers` should apply to it; if the Worker produces it, the 404 page ships without the policy. Not verified at S-3; **answered at P-2, see the P-2 section: the assets layer produces it and the full policy rides along.**

### Not verified, said plainly

The CSP is applied, but its **values** are untested, because nothing it references exists yet. Turnstile (`challenges.cloudflare.com`), GA4 (`www.googletagmanager.com`, `region1.google-analytics.com`) and the YouTube nocookie embed frame are only exercised at P-12 and P-4. `style-src 'unsafe-inline'` is in there for Astro and island inline styles; if Tailwind v4 at P-1 emits a single stylesheet and nothing inlines, tighten it. Re-check the whole policy on the real page, not on the spike page.

## P-1: the Astro 7 move, and does the spike still hold afterwards?

The spike ran on astro 6.4.8. P-1 settled D20 by moving to astro 7.4.1, which meant re-running the S-1 and S-3 checks rather than trusting that a framework patch is inert.

### The Node premise in D20 was wrong

Measured with `npm view <pkg> engines.node`, all on this box (Node 22.23.2, NodeSource, apt candidate 22.23.3, no nvm):

| Package | engines.node | Installable here |
|---|---|---|
| astro 7.3.2 (first release outside the advisory range `<=7.3.1`) | `>=22.12.0` | yes |
| astro 7.4.0 and 7.4.1 | `>=22.22.0` | yes |
| astro 7.4.2 (latest) | `>=22.23.4` | no |
| @astrojs/preact 6.1.0 | `>=22.22.0` | yes |
| @astrojs/preact 6.1.1 | `>=22.23.4` | no |

So the advisory could be cleared with no Node change at all, and D22 replaces D20's plan. `astro`, `@astrojs/preact` and `preact` are pinned at exact versions because `^7` resolves to 7.4.2 and fails the engine check here. After install and `npm audit fix` (which only moved the transitive esbuild to 0.28.2), `npm audit` reports **0 vulnerabilities**, down from 1 critical, 1 high and 1 low.

### Re-verification on the new build

`wrangler dev`, same config, same dist directory. Every check reproduces.

| Check | On astro 6.4.8 | On astro 7.4.1 |
|---|---|---|
| A1 `GET /` | 200 text/html | 200 text/html, 3117 bytes with the real scaffold |
| A2 `GET /api/ping` | 200 JSON from Hono | same |
| A3 `POST /api/spike` valid | 200 | same |
| A4 `POST /api/spike` invalid | 400 `VALIDATION` | same |
| A5 `GET /api/nope` | 404 JSON | same |
| A6 `GET /missing.html` | 404 JSON, the D19 gotcha | same gotcha, unchanged |
| A7 `POST /` | 405 | same |
| A8 `GET /index.html` | 307 to `/` | same |
| A9 assets | n/a | `/_astro/fonts/*.woff2` serves as `font/woff2`, the optimized logo as `image/webp`, both with the `_headers` CSP |
| S-3 scope | `_headers` on assets and redirects, nothing on `/api/*` or the fall-through miss | identical |

D17, D19 and D21 all survive the upgrade. Nothing in the plan changes.

### The CSP values, first exercise

`wrangler dev` serves the real page with `_headers` applied, and the browser logs no console violation while loading it. That covers two directives that were previously only assumed:

- `font-src 'self'`, because the Fonts API self-hosts the woff2 files. The Google Fonts origins came out of the policy at P-1.
- `style-src 'unsafe-inline'`, which S-3 left in tentatively. It is **required**, not tentative: the Fonts API injects an inline `<style>` block with the `@font-face` rules into the head. Do not remove it.

Turnstile, GA4 and the YouTube nocookie frame are still unexercised; they do not exist yet.

### Fonts API, measured

Configured with `fontProviders.google()` for Marcellus (400) and Inter (400 and 600). At build time Astro downloaded the files, copied 2 woff2 into `/_astro/fonts/`, emitted `@font-face` rules with `font-display: swap`, added `<link rel="preload">` for each, generated metric-adjusted fallback faces (`size-adjust`, `ascent-override`), and exposed `--font-marcellus` and `--font-inter` with the configured fallback lists inside them. Setting `styles: ["normal"]` dropped a third italic file. Verified item 6 in ARCHITECTURE is answered for the fonts and the Preact integration; the content config half stays open for P-5.

One trap: the API only emits CSS for a family the page renders with `<Font cssVariable="..." />` from `astro/components/Font.astro`. A configured family nobody renders is silently absent.

### Page weight the budget starts from

Single scaffold page, uncompressed file sizes: 3.0 kB HTML, 6.2 kB CSS, 0 kB JavaScript referenced (the Preact and signals chunks build but nothing hydrates yet), 61 kB of woff2 (Marcellus 13.9, Inter variable 47.3), 48.6 kB logo WebP.

### Marcellus against the logo, the DESIGN section 13 item 4 check

Rendered in a browser at 1024 px wide on black with the logo above it, and probed at 64, 40, 24 and 18 px. At 64 and 40 it is confident and its flared caps rhyme with the logo's without copying them. At 24 px (H3) it is thin but clean. At 18 px the serifs fade against black. Verdict: keep Marcellus, cap the display role at H3, and do not spend the Syne 700 switch. Recorded in DESIGN section 4.

## P-2: the 404 path, and the skeleton on the same Worker

Same machine, astro 7.4.1, wrangler 4.153.0. `not_found_handling = "404-page"` was added to the `[assets]` block in `worker/wrangler.toml`, `web/src/pages/404.astro` was written so `astro build` emits `dist/404.html`, and `npm run dev:worker` served the new build. Checks run 2026-10-27 by Agent (Qoder).

| Probe | Before P-2 (S-1, S-3) | After `not_found_handling = "404-page"` |
|---|---|---|
| `GET /missing.html` | 404 JSON from the Worker catch-all, no `_headers` policy | **404, `text/html`**, body is the built 404 page |
| `GET /no-such-path` (extensionless) | 404 JSON | 404 HTML, same page |
| 404 response headers | none of the six | CSP, `strict-transport-security`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy` all present, so the policy covers the error page |
| `GET /api/ping` | 200 JSON | unchanged, 200 JSON |
| `GET /api/nope` | 404 JSON from the catch-all | unchanged, 404 JSON. `run_worker_first` still beats `not_found_handling` for `/api/*`, which is what D19 wants |
| `GET /` and `GET /_astro/*.css` | 200 with the policy | unchanged |
| A7 `POST /` and A8 `GET /index.html` | 405 and 307 | not re-run at P-2. The config change touches only the miss path |

So the D19 remedy is closed on both halves: the assets layer answers a miss with a browser-usable page and status 404, and the Worker catch-all stays scoped to `/api/*`.

### What the skeleton measures

Built page, no island on it, `npm run build` at 2 pages:

- `web/dist` is 428 KB on disk, of which the four optimized logo WebP files are 21, 30, 77 and 132 KB. A phone with the 390 px viewport picks the 440 or 560 w variant through `srcset`.
- One stylesheet, 17.9 KB raw (Tailwind preflight plus the used utilities plus the scoped nav rule). No `<script>` is referenced by `index.html`, so the Preact runtime files sit in `dist` unused until an island exists.
- Two self-hosted woff2 files, both `document.fonts` reports as loaded, and the H1 computes to the Marcellus family.
- Layout at the two ends of the range: nav 65 px tall at 390 px wide (64 plus the 1 px border) and 73 px at 1200 px, portfolio grid 1 column at 390 and 3 at 1200, process 5 columns at 1200, hero logo 560 px and footer logo 440 px, both above the 220 px minimum in DESIGN section 2.
- Zero `<iframe>` in the output, no `href` pointing outside the origin, and no hex literal outside `tokens.css` (the P-1 test enforces the last one).

### One thing that bites when testing a narrow viewport

`_headers` sets `frame-ancestors 'none'` and `X-Frame-Options: DENY`, so a 390 px `iframe` preview of the served page is blocked by our own policy and its `contentDocument` comes back null. To check a phone width in a browser, serve `web/dist` from a plain static server (no `_headers`) and frame that, or use a device-emulating harness. Verified this way at 390 px and at 1200 px; both are layout checks, not the throttled-4G LCP run, which stays at P-17.

## Open

| Item | Status | Blocks |
|---|---|---|
| S-2 Turnstile and `wa.me` inside the Instagram in-app browser (iOS and Android) | open, device test, cannot be done by an agent | G1, the form design |
| S-3 part 2: D1, Workers, Resend and Turnstile free-tier limits against expected volume | open, and it needs Q6 (enquiries per week) before "expected volume" means anything | G1, L-1 |
| S-4 write the verdict and decide G1 | open, waiting on S-2 and S-3 | G1 |
| Astro upgrades: 7.4.2 and `@astrojs/preact` 6.1.1 both want Node 22.23.4, which this box cannot reach through apt (candidate 22.23.3, no nvm). To take either, install nvm or a newer NodeSource build first, then relax the exact pins | open, low urgency, no advisory pending | P-17 and any later upgrade |

## Dependency versions worth noting

Historic, from the S-1 install on astro 6.4.8. The last three bullets were corrected by P-1, see the section above and decision D22.

`npm audit` after that install: 1 critical and 1 high, both reachable only through the astro dependency tree.

- astro 6.4.8 is inside the advisory range `<=7.3.1` (unescaped attribute and script XSS paths, plus an RCE through AVIF image optimization, and inherited sharp and libvips issues).
- Wrong as written: "the fixes land in astro 7.3.2+, which requires Node `>=22.23.4` for 7.4.2, so Astro 7 is not installable here without a Node bump." Only 7.4.2 wants 22.23.4. 7.3.2 asks for 22.12 and 7.4.1 for 22.22, both of which this box already runs.
- The spike page used none of the affected features, and the risk went away by moving to 7.4.1 rather than by bumping Node.
- Decision taken for the spike: pin astro at 6.4.8, because D13 and every doc said Astro 6. P-1 settled it on 7.4.1.
