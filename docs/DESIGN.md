# DESIGN: Alpha Movies Booking and Showcase Site

Status: Draft v0.7 (P-4 findings: the showreel tap is wired and its script must ship external (D26), the placeholder label belongs in the artwork not on top of it, and the section 6 poster gradient has to come off once a player is in the frame. P-25 added the Process rail and the FAQ treatment, wrote the 44 px tap-target reading for chips, and moved the build onto the section 5 breakpoint scale) | Date: 2026-10-27 | Source: the supplied logo (`assets/brand/alpha-movies-logo-original.png`) | Pairs with PRD.md section 10.

Everything visual in the site comes from here. If a value is not in this file, ask before inventing one. Colors were sampled from the logo file, not from a brand guide, so they are provisional until Emmanuel confirms the logo is current (ROADMAP D-9).

## 1. Direction

A black screening room with gold on it. The page recedes so the work and the logo carry the light. Gold is rare and means "this matters or this is clickable". Nothing is decorated for its own sake.

- Page background is black, `#000000`. This replaces the `#0A0A0A` in the earlier PRD.
- Gold covers at most about 10% of any viewport. If everything is gold, nothing is.
- Video posters and the logo are the brightest things on the page. Text and UI stay quieter.
- Sparkle is a motif, used sparingly. The logo's own flares are the main instance.

## 2. The logo

Supplied file facts, measured:

| Item | Value |
|---|---|
| Original | 4000 x 2667 px, RGBA, transparent background, 2.4 MB |
| Wordmark | Gold 3D bevel lettering "ALPHA MOVIES" with four sparkle flares |
| Web asset | `web/src/assets/brand/alpha-movies-logo.webp`, trimmed, 1600 x 760 px, about 160 KB. It moved out of `assets/brand` at P-1 so Astro optimizes it at build time, where it comes out at 48.6 kB |
| Wordmark proportions | About 96% of the image width and 21% of its height, sitting in the lower middle. The flares occupy the space above and around it |

I composited the original on black and the flares and soft shadow blend cleanly. There is no visible halo box. [Certain]

Rules:

1. Use the logo only on black or very dark surfaces. Gold on white measures about 1.6:1 contrast, which is unreadable. [Certain]
2. On photos or video, place it only over a dark overlay of at least 70% black.
3. Clear space on all sides is 10% of the logo's width (about one cap height of the lettering).
4. Minimum width for the 3D logo is 220 px. Below that the bevel turns to mud. [Guessing] Use the flat wordmark instead (task P-21, not yet produced). Measured at P-2: the web file is 1600 x 760, so at the 64 px nav height it is 135 px wide and at the 220 px minimum it is 105 px tall. Rule 4 and the nav height in section 7 cannot both hold, so the nav carries the brand as text and the 3D logo is used where there is room: the hero and the footer, both at 220 px or wider. Section 13 item 6 tracks the wordmark that lets the nav take the mark back.
5. Never recolor, stretch, outline, add a glow, crop the flares, animate the letters or place it on gold.
6. The hero shows the full logo, large, with its flares. The nav shows the compact version.
7. Never load the 2.4 MB original on the site. Use the WebP. Display it at 800 px wide or less, and the 1600 px file already covers 2x screens.
8. Alt text is "Alpha Movies".

Open: which name leads publicly, Alpha Movies or Boy Concept (ROADMAP Q12). The logo says Alpha Movies, the research brief says Boy Concept. Since P-2 the site renders **Boy Concept** as the brand text in the nav, the page title and the copyright line, which is Ademola's interim call and not Emmanuel's answer. That makes the clash visible: the wordmark artwork spells ALPHA MOVIES two centimetres under a headline that says Boy Concept. Q12 still has to be answered before launch, and P-21 produces the wordmark that matches whichever name wins.

## 3. Color

Sampled from opaque gold pixels in the logo. The lettering shifts from lemon yellow on "ALPHA" to amber on "MOVIES", so the ramp has both ends.

### Tokens

```css
:root {
  /* surfaces */
  --bg:            #000000;  /* page */
  --surface-1:     #0B0B0B;  /* alternate sections */
  --surface-2:     #141414;  /* cards, panels */
  --surface-3:     #1C1C1C;  /* hover, raised */

  /* lines */
  --line:          #2A2A2A;  /* dividers, card edges (decorative) */
  --line-input:    #77736A;  /* input and control boundaries */

  /* text */
  --text:          #F5F1E6;  /* primary, warm off-white */
  --text-2:        #B8B2A3;  /* secondary */
  --text-muted:    #8A8578;  /* captions, 14px and up only */

  /* gold ramp, from the logo */
  --gold-bright:   #FFEF00;  /* highlights, focus ring, hover */
  --gold:          #FBC300;  /* primary brand gold, buttons, links, eyebrows */
  --gold-deep:     #D29A00;  /* "MOVIES" body tone, pressed states */
  --gold-shadow:   #9F6A00;  /* decorative only, never text */
  --bronze:        #491700;  /* bevel edge, decorative only */

  /* flare */
  --flare-core:    #FFFEFB;
  --flare-glow:    #D29600;

  /* gradient and glow */
  --gradient-gold: linear-gradient(100deg, #FFE100 0%, #FFEC00 25%, #F5C500 50%, #D19900 70%, #DBA200 100%);
  --glow-gold:     0 0 32px rgba(251, 195, 0, 0.20);

  /* semantic */
  --error:         #FF6B6B;
  --success:       #3DDC97;
}
```

### Contrast (WCAG), measured

| Pair | Ratio | Use |
|---|---|---|
| `--gold-bright` on black | 17.6 | Passes AAA |
| `--gold` on black | 12.9 | Passes AAA. Primary text color for gold |
| `--gold-deep` on black | 8.4 | Passes AAA |
| `--gold-shadow` on black | 4.5 | Borderline. Decorative only, never text |
| `--text` on black | 18.6 | Body and headings |
| `--text-2` on black | 9.9 | Secondary text |
| `--text-muted` on black | 5.7 | Captions. On `--surface-2` it is 5.0, still passes AA |
| black on `--gold` | 12.9 | Button label |
| black on `--gold-deep` | 8.4 | Pressed button label |
| `--error` on black | 7.6 | Error text |
| `--line-input` on black | 4.4 | Meets the 3:1 needed to identify a control. On `--surface-2` it is 3.9, still passes |
| `--line` on black | 1.5 | Fails 3:1. Decorative dividers only, never a control boundary |

Rules: gold text and buttons only on `--bg`, `--surface-1` or `--surface-2`. Never put gold text on a photo without the overlay. Never convey state by color alone: errors also get an icon and a message.

### Where gold is allowed

- Primary buttons and text links.
- Eyebrow labels above section headings.
- The focus ring.
- Active filter chips and the credentials type label.
- The reference code on the confirmation screen.
- Sparkle motif and hairlines.

Gold is not used for body text, for whole-section backgrounds or for card fills. The gradient appears only on the logo, on primary button hover and on 1 to 2 px hairlines. Never on text.

## 4. Typography

Two families.

| Role | Family | Why | Fallback stack |
|---|---|---|---|
| Display (headings, hero) | Marcellus, 400 | Flared, inscriptional letterforms that echo the logo's flared caps without copying them | `Optima, Candara, Georgia, serif` |
| Interface and body | Inter, 400 / 600 | Neutral, readable on mobile at small sizes | `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |

Checked on 2026-10-27 at P-1, rendered in a browser on black beside the logo (evidence in docs/spikes/stack-spike.md). Marcellus holds up at hero and H2 sizes and its flared caps sit comfortably next to the logo's lettering. At H3 (24 px) it is thin but readable. At 18 px the serifs start to disappear against black. So the display role stops at H3 and the switch to Syne 700 is not needed. [Certain for the sizes tested]

I did not identify the logo's own typeface. Do not claim a match.

Scale (fluid, mobile first):

| Style | Size | Line height | Notes |
|---|---|---|---|
| Display | `clamp(2.5rem, 6vw + 1rem, 5rem)` | 1.05 | Marcellus. Hero only |
| H2 | `clamp(2rem, 4vw, 3rem)` | 1.1 | Marcellus |
| H3 | `1.5rem` | 1.2 | Marcellus |
| Body large | `1.125rem` | 1.6 | Intro lines |
| Body | `1rem` | 1.6 | Inter 400 |
| Small | `0.875rem` | 1.5 | Inter 400, captions |
| Eyebrow | `0.8125rem` | 1.2 | Inter 600, uppercase, tracking `0.18em`, `--gold` |
| Button | `0.9375rem` | 1 | Inter 600, sentence case |

Rules: form fields are 16 px minimum so iOS does not zoom on focus. [Certain] Body line length stays under 70 characters. Do not set long text in all caps. No gold gradient text. Marcellus is for Display, H2 and H3 only, never below 24 px (see the P-1 check above).

## 5. Layout and spacing

- Base unit 4 px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Design at 390 px first. Breakpoints: 768, 1200, 1440.
- Container max width 1200 px. Side gutters 20 px mobile, 32 px tablet, 40 px desktop.
- Section vertical padding 72 px mobile, 120 px desktop.
- Portfolio grid: 1 column on mobile, 2 on tablet, 3 on desktop. Posters are 16:9.
- Radii: buttons 4 px, inputs 6 px, cards 8 px, chips full.
- Tap targets are at least 44 x 44 px.

## 6. Surfaces and depth

Shadows do not show on black, so depth is made with lightness and borders.

- Stack: `--bg` page, `--surface-2` cards, `--surface-3` hover.
- Cards get a 1 px `--line` border. On hover the border becomes `--gold` and the card lifts 2 px. No scaling.
- Glow (`--glow-gold`) only on the primary button hover and the active focus target. Never on text.
- Posters get a bottom gradient `linear-gradient(to top, #000 0%, transparent 60%)` so text stays readable.

## 7. Components

### Buttons

| Variant | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | bg `--gold`, text black | `--gradient-gold` plus `--glow-gold` | bg `--gold-deep` | bg `--line`, text `--text-muted` |
| Secondary | transparent, 1.5 px `--gold` border, text `--gold` | bg gold at 12% | bg gold at 20% | border `--line`, text `--text-muted` |
| Text link | `--gold`, underline offset 4 px | `--gold-bright` | `--gold-deep` | `--text-muted` |

Height 52 px on mobile, 48 px on desktop. Label sentence case: "Check a date", "Open WhatsApp".

### Navigation

Height 64 px mobile, 72 px desktop. Background black at 60% opacity with a 12 px blur, falling back to solid black where blur is unsupported. 1 px `--line` bottom border. Logo left, links center on desktop, primary button "Check a date" right. Mobile shows the logo and the button, with the rest in a menu.

Implemented at P-2 with two changes to that paragraph, both recorded here so the file matches the build:

- The left slot holds the brand as **text** (Marcellus at the H3 size, 24 px, "Boy Concept"), not the 3D logo. See section 2 rule 4: at 64 px tall the logo is 135 px wide, under its own minimum.
- The mobile menu is a `<details>` disclosure, so it works with JavaScript disabled. Two labels are duplicated in markup, one row for desktop and one for the disclosure, because a closed `<details>` cannot be forced open by CSS at the desktop breakpoint.

Nav link labels are Showreel, Work, Services and FAQ, which are the section names from `content/copy.md`. Add or change them there first. "Work" is the same word the section itself prints: the nav said Portfolio until P-25, and one destination needs one name, which also buys back about 20 px in a bar that has 12 px of slack at 320 px.

### Hero

Full logo with flares, large, centered or left-aligned over a quiet black field. One headline, one line of supporting text, two buttons: "Check a date" and "View showreel". No autoplay video iframes. If a background loop is used it is poster-first and short, and never behind the logo without the 70% overlay.

Built at P-3 in `web/src/components/Hero.astro`, centered. Two implementation notes from that build: the logo is the largest element above the fold, so it is the LCP candidate and it renders with `loading="eager" fetchpriority="high"` (Astro defaults to lazy, which costs the hero its largest paint). The headline is a builder draft under decision D25, not approved copy.

### Showreel

16:9 container, poster first, a centered play control, video created on tap. The play control is a 72 px circle with a 1.5 px `--gold` ring and a gold triangle.

Built at P-4. Three implementation notes:

- The placeholder label is drawn into the poster artwork and into the clip, not bolted on as a `.demo-tag` pill. A pill over a 335 x 188 px frame at 390 px wrapped to two lines and covered a fifth of the image. The in-artwork label scales with the frame and disappears with the poster when the player replaces it, which is also what keeps it off the playing controls.
- The section 6 bottom gradient is suppressed once the frame carries a player (`[data-playing]`), because it exists to keep text readable over a poster and would otherwise sit on top of the native controls.
- Until C-2 delivers footage the tap plays `web/public/media/demo-reel.mp4`, a 7 second silent card the builder rendered with ffmpeg (50 kB, poster 16 kB). It says "DEMO REEL" and "Placeholder motion. Not client work." in the frame. Setting `YOUTUBE_ID` in `Showreel.astro` switches the same tap to the youtube-nocookie player, so real footage is a config change and not a rebuild.

### Portfolio card

16:9 poster, category chip top left, title below in H3. The chip is an outlined pill (`--gold` text, 1 px `--gold` border at 60% opacity). Hover per section 6. No auto-playing previews on touch devices.

### Category filter

Chips in a row that scrolls horizontally on mobile. Active chip: bg `--gold`, text black. Inactive: outlined. Hide a chip with no verified projects.

Section 5 asks every tap target for at least 44 x 44 px and the chip renders 32 px tall, so P-25 read the rule as applying to a chip that is a control: `button.chip` and `a.chip` are 44 px, the label chips inside a card or a service tile stay 32 px. The filter row is the one place a thumb does the work, and it is live from P-6.

### Process

Not specified before P-25. The five steps are a sequence, which is the one case where numbering carries information, so each row leads with the number rather than wearing it as a chip: a 44 px outlined numeral, the step name in H3 beside it, the step copy under the name, and a 1 px `--line` rule between rows instead of a card each (`--surface-1` section, so the dividers are the only depth).

The row replaced five cards in a row. With the container capped at 1200 px, five columns are 211 px each and 163 px of text after the card padding, which is about ten characters a line at every width the site has, so the old layout could not hold real step copy at any breakpoint. From the 1200 px breakpoint the heading sits in a left column and the rail in a right one, which keeps a step line near 60 characters instead of running the full 1200.

### FAQ

Four disclosures, `<details>` so they work without JavaScript, each a `--surface-2` card with the question in body semibold and the answer below. No Q1 to Q4 markers: a FAQ is scanned, not stepped through, so numbering them is decoration. The numbered list in the enquiry shell went for the same reason; the field order still reads top to bottom, which is the sequence that matters (FR-11).

### Credentials

Cards on `--surface-2`. Eyebrow type label in `--gold` (Registration, Equipment, Collaboration, Press). Value in `--text`. The source note, if shown, is `--text-muted` at 14 px. Only verified items render. If the section has fewer than the agreed minimum, hide it entirely.

### Enquiry form

- Labels sit above fields in `--text-2`. Inputs are 52 px high, bg `--surface-2`, 1 px `--line-input` border, 6 px radius, 16 px text.
- Focus: border `--gold-bright` plus a 2 px outer ring of `--gold-bright` with a 2 px offset.
- Error: border `--error`, an icon and a message below in `--error`.
- The date field is first. The short-notice message uses an info icon and `--text-2`, not red.
- The "packages start from" line sits above the submit button in `--text-2`, with the amount in `--gold`.
- Submit is the primary button, full width on mobile.

### Confirmation screen

Replaces the form. Shows "Brief received" in H3, the reference code in `--gold` with letter spacing, a primary "Open WhatsApp" button with the WhatsApp icon, and the copyable message in a `--surface-2` card with a Copy button. This is the handoff, so it must be unmissable. Also show the direct WhatsApp link.

### Footer

`--surface-1`, 1 px `--line` top border. Logo, Instagram, YouTube, WhatsApp, base city, copyright. The direct "Already booked with us? Message directly" link lives here and in the form section.

## 8. Motion

| Token | Value |
|---|---|
| Fast | 150 ms |
| Base | 250 ms |
| Slow | 400 ms |
| Easing | `cubic-bezier(0.2, 0.7, 0.2, 1)` |

Implemented in `tokens.css` as `--motion-fast`, `--motion-base`, `--motion-slow` and `--motion-ease`, the same single-source rule as the color tokens.

- Scroll reveal: fade up 16 px, once per element, Base duration.
- Sparkle twinkle: opacity 0.55 to 1 and scale 0.95 to 1.05 over 3 to 4 seconds, at most three flares in view, decorative only. Static on mobile.
- Honor `prefers-reduced-motion`: no reveal, no twinkle, no hover lift.
- No autoplaying video iframes anywhere.

Implemented at P-3, the twinkle only (scroll reveal waits until the sections hold real content). Three four-point SVG flares sit around the hero logo in `Hero.astro`, each `aria-hidden`, `--gold` at 0.55 opacity, animated by one scoped `@keyframes twinkle` with staggered durations (3.4 s, 4 s, 3.4 s) and delays (0, 1.2 s, 2.3 s). "Static on mobile" is read as static below the 768 px breakpoint, so the animation sits inside `@media (min-width: 768px)` and the reduced-motion query sets `animation: none` with opacity 0.8. Verified in a browser: three flares, `animation-name: twinkle` at 1200 px and `none` at 730 px. The reduced-motion branch is written but not exercised, because the available tools cannot emulate that media feature (S-2 and P-17 cover it on devices).

## 9. Imagery and iconography

- Posters and stills are the color on the page. Do not tint them gold.
- Icons are 1.5 px stroke line icons, 24 px grid, currentColor. The sparkle star (four-point) is the only filled glyph, used as a bullet or section marker at 12 to 16 px in `--gold`.
- Real work only. No stock footage and no AI-generated stand-ins for client work.
- One exception, recorded because Ademola chose it on 2026-10-27 at P-4: the showreel plays a silent title card the builder rendered locally (ffmpeg, gold on black, the words "DEMO REEL" and "Placeholder motion. Not client work." inside the frame). It is the product's own artwork, not a stand-in for a specific job, and it is labelled in the image rather than in a caption, so it cannot be mistaken for client work at any size or in a screenshot. It is on P-24's removal list and leaves the moment C-2 delivers footage. Stock footage, AI imagery and unlabelled stills stay barred.
- Every project image needs the client's permission (CMS `publish_ok`).

## 10. Voice

Confident and plain. Short sentences. Say what a visitor can do next. No superlatives such as "elite" or "world-class" unless backed by a verified fact. Buttons are verbs: "Check a date", "Open WhatsApp", "View showreel". Copy lives in `content/copy.md`.

When a sentence is not approved yet, decision D25 in ARCHITECTURE allows the builder to draft one so a demo reads as finished. A draft still obeys every rule on this page, is written into `content/copy.md` with its alternatives, and stays an open row in `content/PLACEHOLDERS.md` until the client approves it.

## 11. Accessibility

- All text pairs in the section 3 table pass WCAG AA or better. Check any new pair before using it.
- Visible focus ring on every interactive element.
- Form fields have labels, not placeholders alone. Errors name the field.
- Logo and posters have alt text. Decorative sparkles are `aria-hidden`.
- Keyboard-only submit works and the confirmation button receives focus.

## 12. Implementation notes

- `web/src/styles/tokens.css` is the only implementation of these tokens, and it exists since P-1. Tailwind v4 maps them to utilities with `@theme inline` in `web/src/styles/global.css`, so a utility compiles to `var(--gold)` rather than a second copy of the hex value. There are no copies anywhere else.
- Never hardcode a hex value outside `tokens.css`. `web/src/styles/design-tokens.test.ts` now enforces this, along with the rule that every section 3 token is declared.
- The section 4 type scale is implemented as Tailwind theme entries in `global.css` (`text-display`, `text-h2`, `text-h3`, `text-body-large`, `text-body`, `text-small`, `text-eyebrow`, `text-button`), because that is where Tailwind reads them. They carry no color values.
- Fonts load through Astro's built-in Fonts API for Marcellus and Inter. Verified at P-1 on Astro 7.4.1: the woff2 files are downloaded at build time and served from the same origin with `font-display: swap`, preload links and metric-matched fallback faces, and the API exposes `--font-marcellus` and `--font-inter`. No third-party font host is needed in the CSP.
- The logo and posters go through Astro's build-time image optimization. The 2.4 MB original is never imported. The web logo now lives at `web/src/assets/brand/alpha-movies-logo.webp` and builds to 48.6 kB.
- Use the focus ring, button and form specs above as shared component styles, not per-page overrides. The focus ring is in the base layer of `web/src/styles/global.css` as a `:focus-visible` rule, so it applies to every interactive element without any component opting in.
- Since P-2 the shared specs are classes in an `@layer components` block in `web/src/styles/global.css`: `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.chip` (with `[data-active="true"]` for the filled state), `.card`, `.poster-frame` and `.demo-tag`. They are written with `@apply` for anything from the `@theme inline` map (type size, radius, color utilities) and with plain CSS for the `tokens.css` variables. `@theme inline` values are **not** emitted as CSS custom properties, so `var(--text-button)` and `var(--radius-button)` do not exist in the browser and only resolve through `@apply`. Verified against the built stylesheet on 2026-10-27.
- Button height is 52 px, becoming 48 px from the 768 px breakpoint, so a hand-written rule, not a utility. Same for the 1.5 px secondary border, the chip outline (gold at 60% through `color-mix`, with a `transparent` fallback declared first), and the poster bottom gradient in section 6, which uses `var(--bg)` rather than a second copy of black.
- Section anchors get `scroll-margin-top` equal to the nav height (64 px, 72 px from 768 px) in the base layer, so "Check a date" does not bury the heading under the sticky nav. Verified at P-3 at 730 px wide: both hero CTAs land their section 64 px from the top, with the heading below the 65 px nav. The 72 px desktop offset is the same rule at the other breakpoint and was not re-measured.
- The hero sparkle flares are the one motion spec that lives in a component rather than `global.css`, in a scoped `<style>` block in `Hero.astro`, because no other section uses them. Astro inlines a style block that small directly into the HTML head instead of emitting a CSS file, so the rules are in the served document and can be checked there.
- The breakpoint scale is the section 5 one, not Tailwind's. `web/src/styles/global.css` resets `--breakpoint-*` and re-declares md 768, lg 1200 and xl 1440, so 640, 1024, 1280 and 1536 do not exist as utilities and a wrong variant name emits no CSS at all rather than a wrong width. Verified against the built stylesheet at P-25: the only width queries in the output are 768, 1200 and 1440. `web/src/styles/design-tokens.test.ts` refuses any `sm:`, `xs:` or `2xl:` in `web/src`.
- One container, one gutter rule: `.container-site` is `mx-auto max-w-site px-5 md:px-8 lg:px-10`, i.e. 20 / 32 / 40 px from section 5, and every section, the nav, the footer and the 404 use it instead of writing `mx-auto max-w-site px-*` per component. Before P-25 ten components each repeated the gutters and the 40 px desktop step existed nowhere.
- The showreel tap is the site's only client script, and it must arrive as a file. Astro 7 inlines a small component `<script>` into the page, `script-src 'self'` then refuses to run it, and the button does nothing with only a console violation to show for it. `vite.build.assetsInlineLimit: 0` in `web/astro.config.mjs` keeps it external (decision D26). `style-src 'unsafe-inline'` is a different matter and stays: the Fonts API and Astro's scoped styles both inject inline `<style>`.
- Posters go through Astro's image pipeline (`web/src/assets/media`), video does not and is served untouched from `web/public/media`. The poster renders at 640 and 1280 widths from one 16 kB source, and the browser picks by `sizes`, so a phone downloads 4 kB rather than the original.
- If a token changes, change this file and `tokens.css` in the same pull request.

## 13. Open items

| # | Item | Owner | Tracked as |
|---|---|---|---|
| 1 | Confirm the supplied logo is the current official one. Ask for a vector or flat version | Ademola, Emmanuel | D-9, Q11 |
| 2 | Decide which name leads publicly. Since P-2 the site renders Boy Concept in the nav, title and copyright as an interim call by Ademola, while the supplied logo artwork spells ALPHA MOVIES | Emmanuel | D-9, Q12 |
| 3 | Produce a flat one-color wordmark, a favicon mark and a 1200 x 630 social image | Ademola, Agent | P-21 |
| 4 | Closed 2026-10-27 at P-1. Marcellus was rendered on black beside the logo: strong at Display and H2, thin but readable at H3, weak below 24 px. The display role stops at H3 and Syne 700 is not needed | done | P-1 |
| 5 | Validate that gold stays under about 10% of a viewport on the built pages | Ademola | P-17 |
| 6 | Section 2 rule 4 (the 3D logo is never below 220 px wide) and section 7 (the nav is 64 px tall) are geometrically incompatible. P-2 resolved it by putting text in the nav. Revisit when the flat wordmark exists, and confirm the interim nav treatment is acceptable | Ademola, Emmanuel | P-21, Q12 |
| 7 | Approve or replace the hero headline. P-3 built it with the builder's draft "Shot for the occasion" under D25; two alternatives are in `content/copy.md`. The page reads as finished copy while no one at Alpha Movies has chosen it | Emmanuel | D-7, P-3, PLACEHOLDERS |
| 8 | Replace the showreel stand-in. P-4 built the poster-first tap and, at Ademola's call, pointed it at a labelled placeholder card so the demo plays. Real poster and video arrive at C-2, then the `YOUTUBE_ID` is set or the file swapped, and the stand-in is deleted with the rest of the scaffolding text | Emmanuel, Agent | C-2, P-24, section 9 exception |
| 9 | Check that the desktop nav still reads as designed now that the breakpoint moved from 1024 to 1200 px, and confirm the 44 px tap-target reading in section 7 (a chip is 44 px when it is a control, 32 px when it is a label) is the treatment you want to keep | Ademola | P-17, P-25 |
| 10 | Two rules in this file are currently claims without a measurement: the 72 px anchor offset at the desktop breakpoint, and section 11's "keyboard-operable form", which has no form until P-12. Measure the first at 1200 px in the P-17 pass; the second arrives with the island | Agent | P-12, P-17 |
