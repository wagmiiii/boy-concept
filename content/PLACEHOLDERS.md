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
| [N] minimum verified items for the credentials section | FR-26; stated in `web/src/components/Credentials.astro` | Ademola, Emmanuel | n/a | open |
| Brand colors and fonts (provisional, from the supplied logo) | docs/DESIGN.md | Emmanuel | Q11 | open |
| Public name that leads: Alpha Movies or Boy Concept | `web/src/components/Nav.astro` (brand text), `<title>`, `web/src/components/Footer.astro` (copyright). Since P-2 the site renders **Boy Concept**, Ademola's interim call, while the supplied logo artwork still spells ALPHA MOVIES | Emmanuel | Q12 | open, interim choice in place |
| Hero brand statement and supporting line | `web/src/components/Hero.astro`. Since P-3 these render as two finished-looking builder drafts ("Shot for the occasion" plus the service line), with two more candidates in `content/copy.md`. They read as approved copy, so treat this row as open until Emmanuel picks one | Emmanuel, copy at C-10 | Q1, Q12 | open, drafted at P-3 awaiting sign-off |
| [Section heading, written at C-10] and intro lines | Hero, Showreel, PortfolioGrid, Credentials, Services, Process, Faq, the enquiry section | Copy at C-10 | Q1, Q8 | open |
| [Showreel heading], the real poster and the real reel | `web/src/components/Showreel.astro`. Since P-4 the mechanism is finished and unverified content is what is missing: the heading is bracketed, and the poster and the tap play a labelled stand-in card (`web/src/assets/media/demo-reel-poster.webp`, `web/public/media/demo-reel.mp4`) that the builder rendered locally, so the pitch demo plays something. The stand-in is the DESIGN section 9 exception and C-2 replaces both files | Emmanuel | Q1, D-7 | open, mechanism done at P-4, media and heading open |
| [project title], category and poster per project card | `web/src/components/ProjectCard.astro`, three DEMO cards in `PortfolioGrid.astro` | Emmanuel, wired at P-5 and P-6 | Q1, Q4 | open |
| [verified credential, from content/verification-log.md] | `web/src/components/Credentials.astro`, two DEMO cards | Emmanuel, wired at P-8 | Q3, Q5 | open |
| [Service n name] and [tag] chips | `web/src/components/Services.astro`, four DEMO cards | Copy at C-10 | Q1, Q7 | open |
| [Step n name] and step copy | `web/src/components/Process.astro`, five DEMO steps | Copy at C-10 | Q7 | open |
| [Question n] and [Answer...] | `web/src/components/Faq.astro`, four DEMO disclosures | Copy at C-10 | Q7, Q9 | open |
| [Response-time line, FR-15: only a time someone keeps] | `web/src/pages/index.astro`, enquiry section | Emmanuel | Q10 | open |
| Instagram [handle], YouTube [channel], WhatsApp [number, P-10] | `web/src/components/Footer.astro`. The number is defined only in `shared/site-config.ts` (P-10) and the link is built at P-15, so nothing in the footer links out yet | Emmanuel | Q3, Q14 | open |
