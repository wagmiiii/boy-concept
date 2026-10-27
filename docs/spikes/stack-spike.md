# Stack spike

Status: in progress. S-1 local half verified. S-5 (the deployed half) blocked on one Cloudflare dashboard click. S-2 and S-3 open. Gate G1 is open.
Environment: Ubuntu x64, Node v22.23.2, npm 10.9.8, wrangler 4.153.0, astro 6.4.8, hono 4.13.14, zod 4.6.7. Run on 2026-10-27 by Agent (Qoder).

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

**The single-Worker design works locally.** `run_worker_first = ["/api/*"]` is the mechanism: it routes only `/api/*` to Hono and lets assets answer everything else. Same origin, no CORS. Decision D17 holds. The two-Worker fallback is not needed for this part.

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

Two conclusions:

1. **No agent-reachable path completes S-5 until a human visits the Cloudflare dashboard once.** The agreed subdomain name is `boy-concept`, chosen deliberately because it is account-wide and will name every future preview URL, including the client's once L-1 moves accounts into his name. Registering it is one page load, after which `wrangler deploy` and `wrangler dev --remote` both work.
2. **P-20 and B-15 inherit this prerequisite.** Whoever runs the first real test deploy needs the same account already set up, so it is worth closing now rather than discovering it on a launch day.

The attempt published nothing and changed nothing in the account (Certain: the deploy failed before upload, and the subdomain POST was rejected). `worker/.wrangler` is local cache and gitignored.

The API token used here was shared in plain text outside a secret store, so rotate it at `dash.cloudflare.com` → API Tokens once S-5 is done. Treat it as spent until then.

## Open

| Item | Status | Blocks |
|---|---|---|
| S-1 deployed half, tracked as S-5 | **blocked** on the one-time workers.dev subdomain registration, see above | G1 |
| S-2 Turnstile and `wa.me` inside the Instagram in-app browser (iOS and Android) | open, device test, cannot be done by an agent | G1, the form design |
| S-3 free-tier limits, and whether `_headers` and the CSP apply to Worker assets | open. A9 shows assets do serve their own cache headers; `_headers` was not present in this run | G1, B-11 |

## Dependency versions worth noting

`npm audit` after install: 1 critical and 1 high, both reachable only through the astro dependency tree.

- astro 6.4.8 is inside the advisory range `<=7.3.1` (unescaped attribute/script XSS paths, plus an RCE through AVIF image optimization, and inherited sharp/libvips issues).
- The fixes land in astro 7.3.2+, which requires Node `>=22.23.4` for 7.4.2. This machine is on 22.23.2, so Astro 7 is not installable here without a Node patch bump.
- The spike page uses none of the affected features. The site will: P-1 uses `astro:image` for posters and the logo, and C-2 supplies client files.

Decision taken for the spike: pin astro `^6.4.8` because D13 and every doc say Astro 6. Flagged for P-1: bump Node past 22.23.4 and move to Astro 7.x at the same time as the scaffold, rather than carrying a critical advisory into the first real build. Do not silently stay on 6.
