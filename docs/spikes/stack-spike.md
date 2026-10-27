# Stack spike

Status: S-1 and S-5 verified, locally and on the edge. S-3 is half answered: `_headers` and the CSP are verified, the free-tier limits check is open. S-2 open, so gate G1 is still open.
Environment: Ubuntu x64, Node v22.23.2, npm 10.9.8, wrangler 4.153.0, astro 6.4.8, hono 4.13.14, zod 4.6.7. Runs on 2026-10-27 by Agent (Qoder).

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

1. Set `not_found_handling` in the `[assets]` block, and ship a real `404.astro` at P-2 so Astro emits `404.html`.
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
- The dashboard now holds a GitHub build integration for this repo whose deploy command is still `npx wrangler deploy`, which keeps failing. Either set that command to `npm run deploy:test` or disconnect the integration. Until one of those happens, every push to main produces a failed Cloudflare build alongside the GitHub Action, and a green one would publish main without anyone choosing to. Task L-6 tracks the decision.
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
3. **B-11 also has to re-test the miss path** once `not_found_handling` and `404.astro` exist. If the assets layer produces the 404 page, `_headers` should apply to it; if the Worker produces it, the 404 page ships without the policy. Not verified yet either way.

### Not verified, said plainly

The CSP is applied, but its **values** are untested, because nothing it references exists yet. Turnstile (`challenges.cloudflare.com`), GA4 (`www.googletagmanager.com`, `region1.google-analytics.com`) and the YouTube nocookie embed frame are only exercised at P-12 and P-4. `style-src 'unsafe-inline'` is in there for Astro and island inline styles; if Tailwind v4 at P-1 emits a single stylesheet and nothing inlines, tighten it. Re-check the whole policy on the real page, not on the spike page.

## Open

| Item | Status | Blocks |
|---|---|---|
| S-2 Turnstile and `wa.me` inside the Instagram in-app browser (iOS and Android) | open, device test, cannot be done by an agent | G1, the form design |
| S-3 part 2: D1, Workers, Resend and Turnstile free-tier limits against expected volume | open, and it needs Q6 (enquiries per week) before "expected volume" means anything | G1, L-1 |
| S-4 write the verdict and decide G1 | open, waiting on S-2 and S-3 | G1 |
| L-6 settle who owns deploys | open, see account state above | P-20 |

## Dependency versions worth noting

`npm audit` after install: 1 critical and 1 high, both reachable only through the astro dependency tree.

- astro 6.4.8 is inside the advisory range `<=7.3.1` (unescaped attribute/script XSS paths, plus an RCE through AVIF image optimization, and inherited sharp/libvips issues).
- The fixes land in astro 7.3.2+, which requires Node `>=22.23.4` for 7.4.2. This machine is on 22.23.2, so Astro 7 is not installable here without a Node patch bump.
- The spike page uses none of the affected features. The site will: P-1 uses `astro:image` for posters and the logo, and C-2 supplies client files.

Decision taken for the spike: pin astro `^6.4.8` because D13 and every doc say Astro 6. Flagged for P-1: bump Node past 22.23.4 and move to Astro 7.x at the same time as the scaffold, rather than carrying a critical advisory into the first real build. Do not silently stay on 6.
