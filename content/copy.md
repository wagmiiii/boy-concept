# Site copy

Single source for all site text. Edit here first, get it approved, then update the pages in `web/src`. Never invent claims. Anything not yet confirmed stays in [brackets] and is listed in `PLACEHOLDERS.md`.

Status: skeleton copy in place since P-2 (nav labels, 404 page, footer and form labels). Since P-3 the hero carries two builder-drafted lines: they read as finished copy but no one at Alpha Movies has approved them, so they are listed as open placeholders and C-10 or Q1 replaces them. P-4 added the showreel data line and the poster alt text; P-26 rewrote both for the carousel and added the autoplay control labels; P-27 drafted the section heading, added the per-item caption, and re-rendered the three clips so their burned-in wording matches it. All of it is in the Showreel section below and none of it is approved. The approved sentences, headlines and answers are written at task C-10 from the client's answers. Until then the pages render bracketed placeholders and DEMO blocks, and they are not shareable with Emmanuel's clients.

## Nav

- Brand text: Boy Concept (interim while Q12 is open, see decision D24)
- Links: Showreel, Work, Services, FAQ (the nav said Portfolio until P-25; it now prints the same word the section itself prints)
- Primary button: Check a date
- Mobile disclosure label: Menu

## Hero

- Headline: "Films with feeling." (candidate A below, built at P-28, with "feeling" in `display-italic`). Builder drafted, not approved. It stays an open placeholder in `PLACEHOLDERS.md` until Emmanuel approves a line, at the D-7 walkthrough or as copy at C-10.
- Candidates considered (P-3 and P-28, none uses a superlative or a claim):
  - A. "Films with feeling." (built at P-28)
  - B. "Films with feeling" (no full stop, if the italic word needs more room at 390 px)
  - C. "The day, kept"
- Subheadline: "Commercial films, cultural festival coverage, wedding and documentary work. Tell us the date and we will tell you what is possible." (built at P-3, also unapproved. It names only the four service categories already in the research brief and the PRD, and promises nothing a booking form cannot deliver.)
- Primary CTA: Check a date
- Secondary CTA: View showreel

## Showreel

- Eyebrow: Showreel
- Title: "See the work in motion" (built at P-27). Builder drafted, not approved, same standing as the hero line. Candidates considered, none of them a claim about the business:
  - A. "See the work in motion" (built)
  - B. "The films, in one place"
  - C. "Watch what we film"
- Per-item visible label (built at P-27, re-cut at P-28): the item's own title, and its category under it in eyebrow caps. A `demo: true` entry prints the stand-in label `sampleFootageLabel` ("Sample footage") instead of its bracketed `[project title]`, on the stage, under the thumbnail, on every card and on the project page. One label everywhere, so a visitor cannot mistake which surface is a sample. Titles are short enough for 112 px and were re-measured at 390 px
- Poster alt text per item (built at P-26): "<label> poster. Placeholder artwork, not client work" while the entry is a stand-in, "<label> poster" once it is shorable.
- Play control label per item (screen readers only): "Play <label>". The strip button's accessible name is the visible caption itself, so a voice-control user can say the words printed under the thumbnail.
- Player title, set only on a YouTube item: "Reel".
- Autoplay controls (built at P-26, screen-reader labels beside 24 px icons): "Pause the reel" / "Play the reel", and "Turn the sound on" / "Turn the sound off". These describe what the page does rather than the business, and they stay whatever C-2 delivers.
- Data line (built at P-4, rewritten at P-26): "The first clip starts on its own, muted and looping, and stops when you scroll past it. Nothing else loads until you press play, so the page never spends your data on a video you did not ask for." Builder drafted, not approved. It claims nothing about the business, only what the page does, but C-10 rewrites it or cuts it once the reel is real.
- Nothing is drawn inside the P-28 posters or clips. The label is DOM text, so it changes with the entry and never survives into real work (D31). The rendered "DEMO REEL n OF 3" artwork retired with the demo-reel files

## Work

This section is called Work everywhere a visitor reads it, the nav and the eyebrow alike (P-25). The component is still `PortfolioGrid.astro` and DESIGN.md still calls the card a portfolio card, which is internal naming.

- Eyebrow: Work
- Title: [write at C-10]
- Intro line: [write at C-10]
- Categories: Commercial, Cultural Festivals, Weddings, Documentaries. Since P-5 the list lives in `projectCategories` in `web/src/content-rules.ts`, which is what the schema accepts and what the chips map over, so this line is a note rather than the source. Changing it means changing the schema and this file together.
- Filter label for the all view: All
- Per-project strings ([project title], [client name], [summary] and the rest) live in the four `demo: true` files under `web/src/content/projects/` until C-2 replaces them, so they are edited there and not here. Their register row is in PLACEHOLDERS.md.

## Credentials

- Eyebrow: Credentials
- Section title: [write at C-10]
- Intro line: [write at C-10]

## Services

- Eyebrow: Services
- Title: [write at C-10]
- Four services with tag chips: [write from client answers at C-10]

## Process

- Eyebrow: Process
- Title: [write at C-10]
- Five steps: [write from client answers at C-10]

## FAQ

- Eyebrow: FAQ
- Title: [write at C-10]
- Questions and answers: [write from the owner's real answers at C-10]

## Enquiry form

- Eyebrow: Check a date
- Title: [write at C-10]
- Field order, from PRD section 7. Event date is first and there is no budget field: Event date, Second date or end date, Project type, Venue, city, country, Duration, Deliverables, Reference video, Name, Company or agency, WhatsApp number, Email, Notes, Consent
- From-price line: Packages start from ₦[amount]
- Response-time line: [only a time someone will keep]
- Submit label: Send brief
- Confirmation text: [write at C-10]

## 404 page

- Eyebrow: 404
- Title: Page not found
- Line: That page is not here. The work, the credentials and the booking form are all on the home page.
- Button: Back to the site

## Footer

- Direct contact line: Already booked with us? Message directly on WhatsApp.
- Base city: [confirm, Q3]
- Instagram: [handle]
- YouTube: [channel]
- WhatsApp: [number, defined only in `shared/site-config.ts`]
- Copyright: © [year] Boy Concept (Alpha Movies Ltd). RC [confirm on CAC public search]

## Scaffolding text to remove at C-10

These lines exist to tell us, not a visitor, what is not built yet. They are inside the DEMO blocks and they go when the real content arrives (task P-24).

- "The chips are disabled: filtering needs the verified projects, and that is task P-6."
- "Sample footage" (the label inside each card and under each reel caption. It is `sampleFootageLabel` in `web/src/content-rules.ts`, one string for every surface, so a wording change is one edit. The bracketed `[project title]` never reaches a visitor)
- "Verified items only. Source note lives in content/verification-log.md."
- "This section hides entirely while it holds fewer than [N] verified items (FR-26, P-8)."
- "The fields are a list, not a working form yet. The island arrives at P-12 with validation, the confirmation screen and the WhatsApp handoff."
- "The link goes live at P-15 and works without JavaScript."
- "The first clip starts on its own, muted and looping, and stops when you scroll past it. Nothing else loads until you press play, so the page never spends your data on a video you did not ask for." (added at P-4, rewritten at P-26 to describe the carousel. It goes with the stand-in media at C-2, which is what DESIGN section 13 item 8 says; P-24 stays the task that clears whatever scaffolding is left)
- "<label> still. Sample footage." (per-item alt text at P-28, so a screen reader hears the same caveat the frame prints. It becomes "<label> still" when C-2 fills the entry in)
