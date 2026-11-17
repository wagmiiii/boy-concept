# Placeholder register

Every bracketed placeholder, wherever it appears. Add a row when you add a placeholder. Mark it resolved when the real, verified value is in place. Launch is blocked while any row is open (ROADMAP tasks R-4 and C-11).

Rows added at P-2 cover the page skeleton, where every unverified string is bracketed and every unverified block is labelled DEMO (decision D23). Copy is written once, in `content/copy.md`, at task C-10.

| Placeholder | Where it appears | Owner | Source question | Status |
|---|---|---|---|---|
| Prepared by [your name] | pitch/Alpha_Movies_Proposal.pptx cover | Ademola | n/a | open |
| ₦[amount] prices and total | pitch deck page 8; `web/src/pages/index.astro` (the from-price line above the submit button) | Emmanuel | Q2 | open |
| [X] weeks, deposit [X]% | pitch deck and proposal | Ademola | n/a | open |
| RC number [Confirm on CAC public search] | pitch deck page 4; `web/src/components/Footer.astro` (copyright line); credentials, P-8 | Ademola | Q3 | open |
| Base city [confirm, Q3] | pitch deck page 4; `web/src/components/Footer.astro` | Emmanuel | Q3 | open |
| [N] minimum verified items for the credentials section | FR-26; wired into `visibleCredentials` in `web/src/content-rules.ts` (P-8), defaulting to minCount=1 | Ademola, Emmanuel | n/a | wired, minimum N to be confirmed at C-9 |
| Brand colors and fonts (provisional, from the supplied logo) | docs/DESIGN.md | Emmanuel | Q11 | open |
| Public name that leads: Alpha Movies or Boy Concept | `web/src/components/Nav.astro` (brand text), `<title>`, `web/src/components/Footer.astro` (copyright). Since P-2 the site renders **Boy Concept**, Ademola's interim call, while the supplied logo artwork still spells ALPHA MOVIES | Emmanuel | Q12 | open, interim choice in place |
| Hero brand statement and supporting line | `web/src/components/Hero.astro`. Since P-28 these render as two finished-looking builder drafts ("Films with feeling." plus the service line), with alternatives in `content/copy.md`. They read as approved copy, so treat this row as open until Emmanuel picks one | Emmanuel, copy at C-10 | Q1, Q12 | open, drafted at P-28 awaiting sign-off |
| [Section heading, written at C-10] and intro lines | Hero, Showreel, PortfolioGrid, Credentials, Services, Process, Faq, the enquiry section | Copy at C-10 | Q1, Q8 | open |
| "See the work in motion" (drafted) and the five reel items | `web/src/components/Showreel.astro` plays five items flagged `hero_reel`, cut from real footage in `/vids` and badged `Sample footage`. What is missing is permission and approval, not mechanism. Heading open awaiting sign-off exactly like the hero line | Emmanuel, Ademola | Q1, D31 | open, drafted at P-27, footage added at P-28 |
| Project titles, client or event names, cities, deliverables, summaries and nine video files | The nine `demo: true` entries in `web/src/content/projects/` (P-28, D31) render as sample cards and project pages with real portrait footage and the `Sample footage` label (`sampleFootageLabel`) instead of a bracketed title. No client name, city or year is invented anywhere: those fields stay absent until C-2 | Emmanuel | Q4, Q5, D31 | open, sample footage in place |
| Written permission for four sample cuts that show a third-party handle or logo, and for identifiable guests in all nine | The footage itself: `@OMOBECKY_` (green-room), `@LONERSZONE_99` (night-shift), `@SHOLLY_STICKS` (aso-oke), sponsor logos (in-conversation), weddings throughout. Either the owner permits the use in writing or the clip comes down | Ademola, Emmanuel | n/a | open, launch risk (DESIGN 9, D31) |
| [verified credential, from content/verification-log.md] | `web/src/content/credentials/*.yaml`, two demo entries wired to `Credentials.astro` at P-8 | Emmanuel, wired at P-8 | Q3, Q5 | open, wired to collection |
| [Service n name] and [tag] chips | `web/src/components/Services.astro`, four DEMO cards | Copy at C-10 | Q1, Q7 | open |
| [Step n name] and step copy | `web/src/components/Process.astro`, five DEMO steps | Copy at C-10 | Q7 | open |
| [Question n] and [Answer...] | `web/src/components/Faq.astro`, four DEMO disclosures | Copy at C-10 | Q7, Q9 | open |
| [Response-time line, FR-15: only a time someone keeps] | `web/src/pages/index.astro`, enquiry section | Emmanuel | Q10 | open |
| Instagram [handle], YouTube [channel], WhatsApp number | `web/src/components/Footer.astro`. WhatsApp number confirmed as 2348027465901 in `shared/site-config.ts`; Instagram and YouTube handles remain open | Emmanuel | Q3, Q14, C-8 | partly resolved (WhatsApp confirmed) |
