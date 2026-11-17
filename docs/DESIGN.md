# DESIGN: Alpha Movies Booking and Showcase Site

Status: v1.0 (P-28 replaced the v0.9 direction end to end: a warm near-black editorial system, Inter with an Instrument Serif italic accent, every video a vertical 9:16 frame, and real sample cuts in place of the rendered DEMO cards. Sections 1 to 9 and 12 to 13 describe the build as it stands. The P-4 to P-27 findings they replace are kept in `ROADMAP.md`) | Date: 2026-11-17 | Source: the supplied logo (`assets/brand/alpha-movies-logo-original.png`) | Pairs with PRD.md section 10.

Everything visual in the site comes from here. If a value is not in this file, ask before inventing one. Colors were sampled from the logo file, not from a brand guide, so they are provisional until Emmanuel confirms the logo is current (ROADMAP D-9).

## 1. Direction

A warm near-black room with a film on the wall. Editorial, not glossy: oversized tight sans headings, one serif italic word for emphasis, gold kept for the thing that matters or the thing you can press. The page recedes so the footage carries the light.

- Page background is `--bg` (`#070606` dark, warm ivory `#F7F3EA` light). Warm rather than neutral: no blue-grey surfaces.
- Text is warm ivory, never pure white. Gold covers at most about 10% of a viewport; a heading carries one gold italic word at most.
- Every video frame is vertical 9:16. The wall of portrait tiles is the page's signature, and a landscape clip is a bug, not a variant (D31).
- Surfaces are flat with a hairline. Depth comes from a glass panel, a border and a shadow, never from a gradient card.
- One grain plate sits over the page at 5% opacity. Decoration only, never a click target.
- The logo's sparkle is retired as a motif. Type, footage and the gold accent carry the page now.

## 2. The logo

Supplied file facts, measured:

| Item | Value |
|---|---|
| Original | 4000 x 2667 px, RGBA, transparent background, 2.4 MB |
| Wordmark | Gold 3D bevel lettering "ALPHA MOVIES" with four sparkle flares |
| Web asset | `web/src/assets/brand/alpha-movies-logo.webp`, 1600 x 760 px, WebP, master resolution with transparent alpha background |
| Wordmark proportions | About 96% of the image width and 21% of its height, sitting in the lower middle. The flares occupy the space above and around it |

The logo renders in full native master quality with a transparent background. It never sits on a light surface: in light mode the hero, footer and 404 wrap it in `.logo-plate`, which paints `--surface-cinema` (`#0B0B0B`) behind it and is transparent in dark mode.

Rules:

1. The transparent wordmark sits only on `--bg` darker than 15% luminance or on a `.logo-plate`. It is never placed on warm ivory, on a poster or on gold.
2. On photos or video, place it only over a dark overlay of at least 70% black.
3. Clear space on all sides is 10% of the logo's width (about one cap height of the lettering).
4. Minimum width for the 3D logo is 220 px. Below that the bevel turns to mud. [Guessing] Use the flat wordmark instead (task P-21, not yet produced). Measured at P-2: the web file is 1600 x 760, so at the 64 px nav height it is 135 px wide and at the 220 px minimum it is 105 px tall. Rule 4 and the nav height in section 7 cannot both hold, so the nav carries the brand as text and the 3D logo is used where there is room: the hero and the footer, both at 220 px or wider. Section 13 item 6 tracks the wordmark that lets the nav take the mark back.
5. Never recolor, stretch, outline, add a glow, crop the flares, animate the letters or place it on gold.
6. The hero, the footer and the 404 show the full logo with its flares. The nav shows the brand as text, never the 3D mark.
7. Never load the 2.4 MB original on the site. Use the WebP. Display it at 800 px wide or less, and the 1600 px file already covers 2x screens.
8. Alt text is "Alpha Movies".

Open: which name leads publicly, Alpha Movies or Boy Concept (ROADMAP Q12). The logo says Alpha Movies, the research brief says Boy Concept. Since P-2 the site renders **Boy Concept** as the brand text in the nav, the page title and the copyright line, which is Ademola's interim call and not Emmanuel's answer. That makes the clash visible: the wordmark artwork spells ALPHA MOVIES two centimetres under a headline that says Boy Concept. Q12 still has to be answered before launch, and P-21 produces the wordmark that matches whichever name wins.

## 3. Color

The gold ramp is sampled from the logo. The surfaces are warm rather than neutral: a warm near-black in dark mode, a warm ivory in light mode. `web/src/styles/tokens.css` is the implementation, and it and this section change together.

### Tokens (dark, default)

```css
:root {
  /* surfaces */
  --bg:            #070606;  /* page */
  --surface-1:     #0D0C0B;  /* panels */
  --surface-2:     #15130F;  /* inset blocks, inputs */
  --surface-3:     #1F1C17;  /* media fallback */
  --surface-glass: rgba(13, 12, 11, 0.62);  /* the nav pill */

  /* lines */
  --line:          #2A2721;  /* decorative hairlines */
  --line-strong:   #3E3930;  /* panel edges that need to read */
  --line-input:    #7E776A;  /* control boundaries */

  /* text */
  --text:          #F6F2E8;  /* warm ivory */
  --text-2:        #B9B2A4;
  --text-muted:    #8D8679;

  /* gold ramp, from the logo */
  --gold-bright:   #FFEF00;
  --gold:          #FBC300;
  --gold-deep:     #D29A00;
  --gold-shadow:   #9F6A00;
  --bronze:        #491700;

  /* cinema plate: transparent in dark mode, a dark frame in light mode */
  --surface-cinema: transparent;
  --line-cinema:    transparent;

  /* ink that only sits on footage */
  --scrim:         rgba(4, 4, 4, 0.58);
  --media-text:    #FFFFFF;

  /* gradient and glow */
  --gradient-gold: linear-gradient(100deg, #FFE100 0%, #FFEC00 25%, #F5C500 50%, #D19900 70%, #DBA200 100%);
  --glow-gold:     0 0 40px rgba(251, 195, 0, 0.18);

  --error:         #FF6B6B;
  --success:       #3DDC97;
}
```

### Light mode

`html[data-theme="light"]` swaps to a warm print room. Gold is re-tuned for contrast on ivory, and `--surface-cinema` becomes `#0B0B0B` so the 3D logo and every video frame keep a dark ground.

```css
html[data-theme="light"] {
  --bg: #F7F3EA; --surface-1: #EFE9DD; --surface-2: #E7E0D2; --surface-3: #DCD3C2;
  --surface-glass: rgba(247, 243, 234, 0.72);
  --line: #D6CDBC; --line-strong: #B9AE9A; --line-input: #857C6C;
  --text: #14120F; --text-2: #494338; --text-muted: #5F584C;
  --gold-bright: #684800; --gold: #7E5800; --gold-deep: #543900;
  --gold-shadow: #3D2900; --bronze: #3B1400;
  --surface-cinema: #0B0B0B; --line-cinema: #2A2A2A;
  --gradient-gold: linear-gradient(100deg, #7E5800 0%, #684800 50%, #543900 100%);
  --glow-gold: 0 0 40px rgba(138, 98, 0, 0.14);
  --error: #C22B2B; --success: #14734A;
}
```

### Contrast (WCAG), calculated from the token values

| Pair | Ratio | Use |
|---|---|---|
| `--gold` on `--bg` | 12.4 | AAA. Gold text and accents in dark mode |
| `--gold-bright` on `--bg` | 17.0 | AAA. Hover and focus |
| `--gold-deep` on `--bg` | 8.1 | AAA. Pressed states |
| `--bg` on `--gold` | 12.4 | Primary button label |
| `--text` on `--bg` | 18.1 | AAA. Headings and body |
| `--text-2` on `--bg` | 9.6 | AAA. Secondary body |
| `--text-muted` on `--bg` | 5.6 | AA. Captions and eyebrows |
| `--line-input` on `--bg` | 4.6 | Above the 3:1 needed to identify a control |
| `--line` on `--bg` | 1.4 | Decorative only, never a control boundary |
| `--error` on `--bg` | 7.3 | Error text |
| `--gold` on `--bg` (light) | 6.0 | AA. Gold text and the primary button surface in light mode |
| `--gold` on `--surface-2` (light) | 4.9 | AA. The worst light ground gold text sits on |
| `--bg` on `--gold` (light) | 6.0 | Primary button label in light mode |
| `--text` on `--bg` (light) | 16.9 | AAA |
| `--text-2` on `--bg` (light) | 8.8 | AAA |
| `--text-muted` on `--bg` (light) | 5.8 | AA |
| `--text-muted` on `--surface-3` (light) | 4.7 | AA. The worst light ground muted text sits on |
| `--line-input` on `--bg` (light) | 3.7 | Above 3:1 |

Rules: gold text and buttons only on `--bg`, `--surface-1` or `--surface-2`. Never put gold text on a poster without the scrim. Never convey state by colour alone: an error also prints a message.

### Where gold is allowed

- Primary buttons and text links.
- One italic word inside a heading, never the whole heading.
- The eyebrow label above a section title, and the index numerals in the form and the process timeline.
- The focus ring, the active chip and the active thumbnail outline.
- The hairline that becomes gold on hover.

## 4. Typography

Two families, loaded through Astro's Fonts API.

| Role | Family | Why | Fallback stack |
|---|---|---|---|
| Interface, body and headings | Inter, 400 / 500 / 600 / 700 | Tight, legible at phone sizes and at 96 px; a neutral frame for the footage | `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| Accent word inside a heading | Instrument Serif, 400 italic (400 roman available) | One word in italic serif gives the editorial contrast the sans cannot, without setting a whole heading in a display face | `Georgia, 'Times New Roman', serif` |

Marcellus is retired: it made every heading look inscriptional and dated the page. The new rule is one sans for structure, one italic serif word per heading at most, set in `.display-italic`. Italic accents are never used for body copy, labels or buttons, and never for a whole heading.

I did not identify the logo's own typeface. Do not claim a match.

Scale (fluid, mobile first):

| Style | Size | Line height | Notes |
|---|---|---|---|
| Display | `clamp(3rem, 8.5vw + 0.5rem, 7.5rem)` | 0.94, tracking `-0.045em` | Inter 600. Hero and page titles only |
| H2 | `clamp(2.25rem, 4.8vw + 0.5rem, 4.25rem)` | 1.0, tracking `-0.035em` | Inter 600 |
| H3 | `clamp(1.35rem, 1.6vw + 0.5rem, 1.85rem)` | 1.15 | Inter 500 to 600 |
| H4 | `1.125rem` | 1.3 | Inter 600, panel and card headings |
| Body large | `1.125rem` | 1.65 | Intro lines |
| Body | `1rem` | 1.65 | Inter 400 |
| Small | `0.875rem` | 1.5 | Inter 400, captions, form notes |
| Eyebrow | `0.75rem` | 1.2 | Inter 500, uppercase, tracking `0.2em`, `--text-muted` or `--gold` |
| Button | `0.9375rem` | 1 | Inter 600, sentence case |

The heading scale is set tight on purpose: large sizes lose tracking, small sizes keep it. `display-italic` swaps a word to Instrument Serif italic at the same size and tracking as its parent heading; it carries the gold colour where the heading uses it.

Rules: form fields are 16 px minimum so iOS does not zoom on focus. [Certain] Body line length stays under 70 characters. Do not set long text in all caps. No gold gradient text, no gradient headings, no outlined type.

## 5. Layout and spacing

- Base unit 4 px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Design at 390 px first. Breakpoints: 768, 1200, 1440.
- Container max width 1200 px. Side gutters 20 px mobile, 32 px tablet, 40 px desktop.
- Section vertical padding 72 px mobile, 120 px desktop.
- Portfolio grid: a CSS column wall, 1 column on mobile, 2 on tablet, 3 on desktop. Every tile is 9:16.
- Radii: buttons and chips `999px` (full), inputs 14 px, cards 20 px, panels 28 px.
- Tap targets are at least 44 x 44 px.
- The container is 1280 px (`--container`), wider than the old 1200, because a three-column portrait wall needs the room. Section padding 80 px mobile, 128 px from `md`.

## 6. Surfaces and depth

Depth is lightness, a hairline and one shadow, not a gradient card.

- Stack: `--bg` page, `--surface-1` panels, `--surface-2` inset blocks, `--surface-3` media fallback.
- Panels use `.panel`: 1 px `--line`, `--surface-1`, `--radius-panel`. A media tile uses `.tile-frame`.
- `.glass` is `--surface-glass` with a 22 px blur and a saturate, used only for the floating nav and small floating pills. Where blur is unsupported it falls back to `--surface-1`.
- `.ambient-gold` is one soft radial gold wash behind a page header, at 14% gold and fading to nothing. It never sits behind body text.
- Footage carries its own scrim (`--scrim`) and its own ink (`--media-text`), so a caption stays readable on a bright frame and neither token is used on the page itself.
- `.grain` is a fixed SVG noise plate at 5% opacity over the whole page, `pointer-events: none`.

## 7. Components

### Buttons

| Variant | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | bg `--gold`, text black | `--gradient-gold` plus `--glow-gold` | bg `--gold-deep` | bg `--line`, text `--text-muted` |
| Secondary | transparent, 1.5 px `--gold` border, text `--gold` | bg gold at 12% | bg gold at 20% | border `--line`, text `--text-muted` |
| Text link | `--gold`, underline offset 4 px | `--gold-bright` | `--gold-deep` | `--text-muted` |

Height 52 px on mobile, 48 px on desktop. Label sentence case: "Check a date", "Open WhatsApp".

### Navigation

A floating glass pill that spans the container, inset from the top, with the brand as text on the left, the four section links in the middle at `md` and above, and a gold pill "Check a date" on the right. Below `md` the links collapse into a full-screen overlay sheet built from a real button and `aria-expanded`, with the four links, the theme toggle and the same CTA stacked at 44 px. The bar is `.glass` over `--surface-glass` with a 22 px blur; it is not a solid strip and it has no bottom border.

The brand stays text ("Boy Concept") rather than the 3D logo: at the pill's height the logo is under its own 220 px minimum (section 2 rule 4).

A 2 px gold scroll progress line sits at the very top of the viewport, driven by one passive scroll listener and disabled under `prefers-reduced-motion`.

### Hero

Editorial split. Left: an eyebrow, the display headline ("Films with feeling." with "feeling" in `display-italic` gold), one supporting paragraph, two pill buttons ("Check a date" primary, "Watch the reel" secondary), then the 3D logo on a hairline rule with a one-line explanation. Right: a portrait media card at 9:16, poster first, with a second smaller 9:16 frame offset behind it and rotated 2 degrees at `md` and above.

The media card is the page's only tap-to-play surface above the fold: the poster is an image, and the `<video>` element is created inside the click, so nothing points at a video byte before the visitor asks. The card carries a "Now screening" tag, its category in mono, the project title and the `Sample footage` label. The logo is the LCP candidate and renders `loading="eager" fetchpriority="high"` behind `.logo-plate`, which keeps it on black in light mode.

Under the hero, a marquee strip of the six service words scrolls slowly between hairlines, duplicated once for the loop and `aria-hidden`.

### Showreel

The section is centred on a single 9:16 stage, 400 px wide at most, with the header copy above it and the controls and a 5-item portrait thumbnail strip below. Every thumbnail is 9:16, 112 px wide on mobile and 132 px from `md`. The active thumbnail carries a 2 px `--gold` outline. Each item shows its poster first with a 56 px play circle; the caption inside the frame carries the category, the title and the `Sample footage` label.

The items are the visible projects flagged `hero_reel` (ARCH section 5). Weddings are excluded by content, not by code, so the reel never autoplays a ceremony.

Autoplay, decision D29, unchanged by the redesign:

- Only the first item starts by itself, only when its source is a file we serve from `/media`, and never an iframe.
- It is muted, looping and silent, waits for the page `load` event, and runs only while the stage is at least half on screen. Scrolling away pauses it; scrolling back resumes it.
- A 44 px pause control is visible while it plays, and `prefers-reduced-motion` suppresses the autoplay entirely.
- Every other item is tap-only, including the rest of the reel.
- The cap is 15 seconds and 400 kB. The five cuts shipped at P-28 run 6 seconds at 480 x 854 and weigh 136 to 391 kB; the heaviest two were re-encoded twice to get under the cap.

The visibility states live on data attributes (`data-playing`, `data-paused`, `data-autoplay`) and the scoped style block reads them with raw `var()` values, because `@apply` does not work in a component style tag.

### Portfolio card

A 9:16 poster under `tile-frame`, the category as a tag top left, the tile index in mono top right, and the title bottom left over the frame's own scrim. A `demo: true` entry adds the `Sample footage` label under the title instead of printing nothing. The whole card is one link to the project page; playback belongs to that page. Hover lifts the border to gold and scales the poster 1.04. There are no autoplaying previews.

### Category filter

Chips in a row that scrolls horizontally on mobile. The active chip is filled `--gold` on `--bg`; the rest are outlined. A chip only exists for a category that holds work (FR-26).

A chip that is a control (`button.chip`, `a.chip`, the form's deliverable chips) is 44 px tall; a label chip inside a card stays 32 px.

### Process

A sticky timeline: the heading and intro sit in a left column that sticks while the right column scrolls through the steps. Each step is a numbered line with a hairline, the step name at H4 and the copy under it. The number is the sequence, which is the one place numbering carries information.

### FAQ

`<details>` disclosures, so they work without JavaScript, each on its own hairline with a large question at H3 and the answer below. No numbering. The gold plus/minus marker is CSS only.

### Credentials

Cards on `--surface-2`. Eyebrow type label in `--gold` (Registration, Equipment, Collaboration, Press). Value in `--text`. The source note, if shown, is `--text-muted` at 14 px. Only verified items render. If the section has fewer than the agreed minimum, hide it entirely.

### Enquiry form

One panel, three numbered fieldsets and no budget field anywhere. Order: date and place (date first, always), the film, then contact. Inputs are 16 px, `--surface-2` on `--bg` with a 1 px `--line-input` boundary and a 14 px radius; focus swaps the boundary to gold. Errors name the field and print under it in `--error`.

Deliverables are toggle chips (`aria-pressed`), not checkboxes. The reference video field swaps to a notes requirement when "I will describe it instead" is checked. A contact block requires a WhatsApp number or an email, and the newsletter-style consent line links the privacy notice. The hidden honeypot stays.

The submit button builds the brief locally and opens the confirmation state; the POST to `/api/enquiries` runs in the background and can fail without stopping the handoff (ESSENTIALS rule 5).

### Confirmation screen

Replaces the form in place. A gold check, "Your brief is written", one primary button "Open WhatsApp and send" (the only handoff), the deep-link fallback line for in-app browsers, and the assembled message in a scrollable block with a copy button. A line states plainly that nothing has been sent yet. "Start another brief" resets the form.

### Footer

A closing CTA at display size ("Tell us the date.") with the commission button and the direct WhatsApp link, then a three-column base: the 3D logo on a plate and a one-line description, the section links, and the legal and contact links. Every number and address comes from `shared/site-config.ts`.

## 8. Motion

| Token | Value |
|---|---|
| `--motion-fast` | 160 ms |
| `--motion-base` | 260 ms |
| `--motion-slow` | 440 ms |
| `--motion-ease` | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--ease-in-out-cubic` | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| `--ease-out-cubic` | `cubic-bezier(0.33, 1, 0.68, 1)` |
| `--ease-out-back` | `cubic-bezier(0.34, 1.36, 0.64, 1)` |

- Scroll reveal: `[data-reveal]` elements fade up 16 px and settle, once each, observed by one IntersectionObserver in `Base.astro`. `[data-reveal-delay="1".."4"]` staggers by 60 ms per step. The same elements are visible with JavaScript off: the observer only removes an initial state.
- Hover: borders move to gold over `--motion-base`; posters scale 1.04 over 900 ms; no element moves more than 8 px.
- Marquee: the service strip translates by half its own width on a linear loop, paused on hover, `aria-hidden`, and duplicated once.
- Reduced motion: one media query in `global.css` disables reveal, marquee, hover transforms and smooth scrolling, and the reel script skips the autoplay branch entirely (D29). Poster and tap to play still work.

## 9. Imagery and iconography

- Every video on the site is vertical 9:16. The work cuts are 8 second, 720 x 1280, silent H.264 at CRF 27; the five reel cuts are 6 second, 480 x 854, silent, CRF 33 to 36, all under 400 kB.
- Posters are 720 x 1280 JPEGs pulled from the cut itself, so a tile shows a frame the visitor will actually see. They run through Astro's image pipeline and become WebP at build.
- Footage is never tinted. The scrim exists so a caption reads, not to colour-grade.
- Icons are 1.5 px stroke line icons at currentColor, except media transport (play, pause), which stays filled.
- Real work only, with one labelled exception below. No stock footage, no AI imagery.

### The sample footage exception (D31)

The nine projects shipped at P-28 are `demo: true` entries built from the studio's own unused shots: the sixteen source files in `/vids`, cut to one vertical clip each. They are real footage, not rendered cards, but none of them has a client permission or a verified brief, so every surface badges them `Sample footage` and every entry keeps `verified: false` and `publish_ok: false`. The label is text, not artwork burned into the frame, and a real project never prints it.

Three things about these files are launch risks, not design decisions:

1. Four cuts carry a handle or logo in the frame (`@OMOBECKY_`, `@LONERSZONE_99`, `@SHOLLY_STICKS`, and sponsor logos on the robotics hall). They are visible and cannot be cropped out without losing the subject. Closed on 2026-11-17: Ademola confirmed these were shot by Boy Concept and uploaded by the client, so the handles are the client's own accounts and nothing third-party is shown. What remains open is consent from the identifiable people in the frames, not the branding.
2. Guests and couples are identifiable, including a wedding party and children in one dropped campaign clip. Three source clips were dropped for this reason: a client's engagement invitation with their names, a retail campaign with minors, and a Pizza Hut advert with agency watermarks.
3. The number of source clips is finite. Nine is enough for a wall; it is not a portfolio.

C-2 replaces these files entry by entry. The code path does not change: `demo: false`, `verified: true`, `publish_ok: true`, a permitted `poster` and `video_url`.

## 10. Voice

Confident and plain. Short sentences. Say what a visitor can do next. No superlatives such as "elite" or "world-class" unless a verified fact backs them. Buttons are verbs: "Check a date", "Build the WhatsApp brief", "Open WhatsApp and send".

Copy lives in `content/copy.md`. A builder draft (D25) is still a draft: it obeys every rule here, it ships with alternatives, and it stays an open row in `content/PLACEHOLDERS.md` until the client approves it.

## 11. Accessibility

- Every text pair in section 3 passes AA, and the body pairs pass AAA.
- Visible focus ring on every interactive element, `2px` `--gold-bright` at 2 px offset.
- A media frame is a poster with a labelled button, never a bare clickable `div`.
- Form fields have visible labels, errors name the field and are announced with `role="alert"`. Fields are 16 px minimum so iOS does not zoom.
- Deliverable toggles are buttons with `aria-pressed`, so they are reachable and stateful without a pointer.
- The reel's first clip has a 44 px pause control and a `prefers-reduced-motion` escape (WCAG 2.2.2). Every other clip needs a tap.
- The menu is a real button with `aria-expanded`, and the overlay traps nothing: Escape closes it.
- Decorative layers (grain, marquee duplicate, ambient wash) are `aria-hidden` and `pointer-events: none`; ambient and grain are also `aria-hidden` in markup.

## 12. Implementation notes

- `web/src/styles/tokens.css` holds every token. `web/src/styles/global.css` maps them to Tailwind with `@theme inline`, then defines the component classes in one `@layer components` block. No hex value exists outside `tokens.css`; `design-tokens.test.ts` enforces that.
- Component classes: `.container-site`, `.eyebrow`, `.display-italic`, `.btn-primary`, `.btn-secondary`, `.btn-icon`, `.chip` (with `[data-active]`), `.tag`, `.panel`, `.glass`, `.media-frame`, `.stage-frame`, `.tile-frame`, `.grain`, `.ambient-gold`, `.logo-plate`, `.field`, `.field-label`, `.marquee`.
- `.stage-frame`, `.tile-frame` and `.media-frame` are written as one selector list rather than `@apply`-ing a custom class, because Tailwind 4 refuses `@apply` of a component class. Their scrim is a `::after` that is removed once the frame carries a player (`[data-playing]`).
- Fonts: Astro's Fonts API, Inter 400/500/600/700 and Instrument Serif 400 normal and italic, configured in `web/astro.config.mjs` and preloaded in `Base.astro`. No third-party font host is needed in the CSP.
- Breakpoints are `md` 768, `lg` 1200, `xl` 1440. `global.css` resets Tailwind's scale so 640, 1024 and 1280 do not exist; `design-tokens.test.ts` rejects `sm:`, `xs:` and `2xl:`.
- One container: `.container-site` is `mx-auto max-w-site px-5 md:px-8 lg:px-10`, i.e. 20 / 32 / 40 px, over a 1280 px max.
- `@apply` works only inside `global.css`. A component `<style>` block holds plain CSS reading `var(--token)`.
- Astro inlines a small component `<script>` into the HTML, and `script-src 'self'` then refuses it. `vite.build.assetsInlineLimit: 0` keeps every script external (D26).
- Posters go through the image pipeline from `web/src/assets/media/work/`; video is served untouched from `web/public/media/work/` and `web/public/media/reel/`.
- If a token changes, change this file and `tokens.css` in the same commit.

## 13. Open items

| # | Item | Owner | Tracked as |
|---|---|---|---|
| 1 | Confirm the supplied logo is current, and ask for a vector or flat version | Ademola, Emmanuel | D-9, Q11 |
| 2 | Decide which name leads publicly. The site renders Boy Concept while the logo spells ALPHA MOVIES | Emmanuel | D-9, Q12 |
| 3 | Approve or replace the hero headline. P-28 re-drafted it as "Films with feeling." under D25 | Emmanuel | D-7, PLACEHOLDERS |
| 4 | Approve or replace the reel and work headings ("See the work in motion", "A catalogue of moments") | Emmanuel | D-7, PLACEHOLDERS |
| 5 | Sample cuts that carry a handle or logo: answered 2026-11-17. The four cuts are Boy Concept's own footage, uploaded by the client, so the handles are the client's accounts and no third-party permission is outstanding. Still open on the same footage: consent for the identifiable guests in the frames | Ademola, Emmanuel | C-2, D31, PLACEHOLDERS |
| 6 | Light mode checked on 2026-11-17 (P-28). Two tokens failed AA for small text and were re-tuned: `--text-muted` was 4.23:1 on `--surface-1` and is now 4.73:1 (#5F584C), and `--gold` was 4.18:1 on `--surface-2` and is now 4.87:1 (#7E5800). The logo plate renders #0B0B0B with 18/22 px around the 3D mark on the hero and the footer, and the grain reads at 3.5% on a light ground. The same reading was repeated on the deployed build the same day, on pages served from the Worker at https://boy-concept-spike.ademola2993k.workers.dev, and both pairs hold there | Agent | P-17 |
| 7 | Validate that gold stays under about 10% of a viewport | Ademola | P-17 |
| 8 | Measure the mobile pass properly: LCP on throttled 4G, the reel's autoplay bytes, keyboard order through the new form, and the 390 px layout with the nine real posters | Ademola | P-17 |
| 9 | Replace the sample entries with permitted work and delete `/vids` from the repo once the cuts are approved | Emmanuel, Agent | C-2 |

