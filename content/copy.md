# Site copy

Single source for all site text. Edit here first, get it approved, then update the pages in `web/src`. Never invent claims. Anything not yet confirmed stays in [brackets] and is listed in `PLACEHOLDERS.md`.

Status: skeleton copy in place since P-2 (nav labels, 404 page, footer and form labels). Since P-3 the hero carries two builder-drafted lines: they read as finished copy but no one at Alpha Movies has approved them, so they are listed as open placeholders and C-10 or Q1 replaces them. The approved sentences, headlines and answers are written at task C-10 from the client's answers. Until then the pages render bracketed placeholders and DEMO blocks, and they are not shareable with Emmanuel's clients.

## Nav

- Brand text: Boy Concept (interim while Q12 is open, see decision D24)
- Links: Showreel, Portfolio, Services, FAQ
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

## Portfolio

- Eyebrow: Work
- Title: [write at C-10]
- Intro line: [write at C-10]
- Categories: Commercial, Cultural Festivals, Weddings, Documentaries
- Filter label for the all view: All

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

- "DEMO: media arrives at P-4"
- "DEMO poster"
- "The chips are disabled: filtering needs the verified projects, and that is task P-6."
- "Verified items only. Source note lives in content/verification-log.md."
- "This section hides entirely while it holds fewer than [N] verified items (FR-26, P-8)."
- "The fields are a list, not a working form yet. The island arrives at P-12 with validation, the confirmation screen and the WhatsApp handoff."
- "The link goes live at P-15 and works without JavaScript."
