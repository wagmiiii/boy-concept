# Site copy

Single source for all site text. Edit here first, get it approved, then update the pages in `web/src`. Never invent claims. Anything not yet confirmed stays in [brackets] and is listed in `PLACEHOLDERS.md`.

Status: skeleton copy in place since P-2 (nav labels, 404 page, footer and form labels). Since P-3 the hero carries two builder-drafted lines: they read as finished copy but no one at Alpha Movies has approved them, so they are listed as open placeholders and C-10 or Q1 replaces them. P-4 added the showreel data line and the poster alt text; P-26 rewrote both for the carousel and added the autoplay control labels. All of it is in the Showreel section below and none of it is approved. The approved sentences, headlines and answers are written at task C-10 from the client's answers. Until then the pages render bracketed placeholders and DEMO blocks, and they are not shareable with Emmanuel's clients.

## Nav

- Brand text: Boy Concept (interim while Q12 is open, see decision D24)
- Links: Showreel, Work, Services, FAQ (the nav said Portfolio until P-25; it now prints the same word the section itself prints)
- Primary button: Check a date
- Mobile disclosure label: Menu

## Hero

- Headline: "Shot for the occasion" (candidate A below, built at P-3). Builder drafted, not approved. It stays an open placeholder in `PLACEHOLDERS.md` until Emmanuel approves a line, at the D-7 walkthrough or as copy at C-10.
- Candidates considered (P-3, all two or three words, none uses a superlative or a claim):
  - A. "Shot for the occasion" (built)
  - B. "Filmed for the moment"
  - C. "Your day, on film"
- Subheadline: "Commercial films, cultural festival coverage, wedding and documentary work. Tell us the date and we will tell you what is possible." (built at P-3, also unapproved. It names only the four service categories already in the research brief and the PRD, and promises nothing a booking form cannot deliver.)
- Primary CTA: Check a date
- Secondary CTA: View showreel

## Showreel

- Eyebrow: Showreel
- Title: [write at C-10]
- Poster alt text per item (built at P-26): "<project title> poster. Placeholder artwork, not client work" while the entry is a stand-in, "<project title> poster" once it is shorable. The title comes from the content entry, so the label changes when C-2 fills it in; nothing here has to be edited.
- Play control label per item (screen readers only): "Play <project title>", and the same title names the thumbnail button in the strip.
- Player title, set only on a YouTube item: "Reel".
- Autoplay controls (built at P-26, screen-reader labels beside 24 px icons): "Pause the reel" / "Play the reel", and "Turn the sound on" / "Turn the sound off". These describe what the page does rather than the business, and they stay whatever C-2 delivers.
- Data line (built at P-4, rewritten at P-26): "The first clip starts on its own, muted and looping, and stops when you scroll past it. Nothing else loads until you press play, so the page never spends your data on a video you did not ask for." Builder drafted, not approved. It claims nothing about the business, only what the page does, but C-10 rewrites it or cuts it once the reel is real.
- Placeholder text drawn inside each poster and clip: "DEMO REEL 1 OF 3" through "3 OF 3" and "Placeholder motion. Not client work." These are pixels in `demo-reel-1-poster.webp` to `-3-` and `demo-reel-1.mp4` to `-3.mp4`, not strings in a component, so C-2 replaces them by replacing the files rather than by an edit here.

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
- "DEMO poster" (the label inside each portfolio card; the showreel no longer prints one, its label is drawn into the poster and the clip)
- "Verified items only. Source note lives in content/verification-log.md."
- "This section hides entirely while it holds fewer than [N] verified items (FR-26, P-8)."
- "The fields are a list, not a working form yet. The island arrives at P-12 with validation, the confirmation screen and the WhatsApp handoff."
- "The link goes live at P-15 and works without JavaScript."
- "The first clip starts on its own, muted and looping, and stops when you scroll past it. Nothing else loads until you press play, so the page never spends your data on a video you did not ask for." (added at P-4, rewritten at P-26 to describe the carousel. It goes with the stand-in media at C-2, which is what DESIGN section 13 item 8 says; P-24 stays the task that clears whatever scaffolding is left)
- "<project title> poster. Placeholder artwork, not client work" (the per-item alt text, added at P-26. It is built from the entry's own bracketed title, so it disappears when C-2 fills the entries in rather than when a component is edited)
