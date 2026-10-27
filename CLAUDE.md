@AGENTS.md

# Claude Code notes

Everything in AGENTS.md applies. The points below are specific to Claude Code.

## Workflow

- Before starting, read the `ROADMAP.md` header and the tasks you will touch.
- Before ending any task, run the contribution protocol in AGENTS.md: update `ROADMAP.md` (always), `PROJECT_STRUCTURE.md` (if files changed) and the decision docs (if a decision changed). Do not skip it for small changes, and say in your final message what you updated.
- Use plan mode for multi-file changes and present the plan before editing.
- Prefer targeted edits over rewriting whole files. Keep diffs small.
- After changing code, run typecheck and tests yourself instead of asking Ademola to.
- Do not spawn subagents for small edits. Use them for exploring large amounts of code or docs.

## Context hygiene

- Read `docs/ARCHITECTURE_ESSENTIALS.md`. Open the longer docs only when the task needs them.
- Use `/clear` between unrelated tasks.
- When compacting, keep the hard rules, the current phase and the task in progress.

## Permissions

Ask before running anything that deploys, publishes, deletes, installs global packages or touches git history. `wrangler deploy` is allowed only with `--env test` and only when asked.

## Astro and Cloudflare

You can run the site and the Worker locally, so run `npm run typecheck` and `npm test` yourself. Astro here is static output with no server adapter. Do not add one. Use `wrangler` only for local development and, when asked, `deploy:test`. Anything in the "Verify before building" list in `ARCHITECTURE.md` stays unverified until you ran the check and recorded it in `docs/spikes/stack-spike.md`. You cannot test inside the Instagram in-app browser, so say so rather than claiming it works.

## Corrections

When Ademola corrects you on a project rule, propose the exact line to add to `AGENTS.md` instead of relying on memory.
