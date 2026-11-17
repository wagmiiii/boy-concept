// docs/ARCHITECTURE.md section 4, PRD section 7, and decision D16:
// Pure functions for WhatsApp brief message and deep link generation.
// Rule 4: wa.me numbers are digits only (no plus, no leading zeros).
// Rule 5: A backend failure never blocks the handoff.

export interface BriefInput {
  ref?: string;
  projectType: string;
  date: string;
  flexibleDate?: boolean;
  venue?: string;
  city?: string;
  country?: string;
  duration: string;
  deliverables: string[];
  referenceVideo?: string;
  name: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  notes?: string;
}

/**
 * Normalizes phone numbers to pure digits for wa.me URLs.
 * Converts local Nigerian format (e.g. 08012345678) to 2348012345678.
 * Strips plus signs, spaces, hyphens, and leading zeros.
 */
export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Sanitizes input strings to prevent WhatsApp message injection or URL splitting.
 * Strips non-printable control characters and enforces length limits.
 */
function sanitize(val: string | undefined, maxLen = 300): string {
  if (!val) return "";
  // Strip control characters (except basic space and punctuation).
  const cleaned = val.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  // A lone surrogate cannot be percent-encoded and makes encodeURIComponent throw, which would
  // take the whole form down, so half of a broken pair is dropped here (P-29).
  const wellFormed = cleaned.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    "",
  );
  const points = Array.from(wellFormed);
  return points.length > maxLen ? points.slice(0, maxLen).join("") : wellFormed;
}

/**
 * Budget for the pre-filled brief, pinned by P-29.
 *
 * A brief with every field at its cap (including the six deliverables the form offers) is 2,391
 * characters before encoding, which makes a 2,538 character wa.me link. Percent-encoding makes
 * that worse: a non-ASCII character costs three to twelve characters on the wire, so an
 * emoji-heavy note can triple the link. Some mobile webviews truncate or drop a long wa.me link
 * silently, which loses the brief with no error shown to either side, so the message is held
 * inside a fixed budget instead.
 */
export const MAX_MESSAGE_LENGTH = 1400;
export const MAX_WA_URL_LENGTH = 2048;

// Longest plausible wa.me prefix: scheme, host, a full 15 digit E.164 number and the text parameter.
const WA_URL_OVERHEAD = "https://wa.me/".length + 15 + "?text=".length;

function overBudget(text: string): boolean {
  return (
    text.length > MAX_MESSAGE_LENGTH ||
    WA_URL_OVERHEAD + encodeURIComponent(text).length > MAX_WA_URL_LENGTH
  );
}

/**
 * Holds the brief inside both budgets. The structured lines are kept whole and the note, which is
 * the only free-text line, keeps whatever room is left rather than vanishing: a visitor who wrote
 * a paragraph deserves to have the start of it arrive.
 */
function fitToBudget(lines: string[]): string {
  const whole = lines.join("\n");
  if (!overBudget(whole)) return whole;

  const notesIndex = lines.findIndex((line) => line.startsWith("Notes: "));
  if (notesIndex !== -1) {
    const prefix = lines.slice(0, notesIndex).join("\n");
    // Slice by code point, never by UTF-16 unit: cutting an emoji in half would leave a lone
    // surrogate and make encodeURIComponent throw.
    const notes = Array.from(lines[notesIndex]!.slice("Notes: ".length));

    // Encoding cost grows with length, so the largest note that still fits is found by search.
    let low = 0;
    let high = notes.length;
    let best = 0;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (overBudget(`${prefix}\nNotes: ${notes.slice(0, mid).join("")}`)) {
        high = mid - 1;
      } else {
        best = mid;
        low = mid + 1;
      }
    }
    if (best > 0) return `${prefix}\nNotes: ${notes.slice(0, best).join("").trimEnd()}`;
    return holdPrefix(prefix);
  }
  return holdPrefix(lines.join("\n"));
}

/** Last resort when even the structured lines are over budget: trim in proportion. */
function holdPrefix(prefix: string): string {
  let message = prefix;
  while (overBudget(message) && Array.from(message).length > 1) {
    const points = Array.from(message);
    const kept = Math.max(1, Math.floor(points.length * 0.8));
    message = points.slice(0, kept).join("").trimEnd();
  }
  return message;
}

/**
 * Builds the pre-filled brief message per PRD section 7.
 * Phase 0 omits the Ref line when none is assigned.
 */
export function buildWhatsAppMessage(brief: BriefInput): string {
  const lines: string[] = [];

  const refClean = sanitize(brief.ref, 20);
  if (refClean) {
    lines.push(`Hello Alpha Movies, I just submitted a brief (Ref ${refClean}).`);
  } else {
    lines.push("Hello Alpha Movies, I just submitted a brief.");
  }

  lines.push(`Project: ${sanitize(brief.projectType, 80)}`);

  const dateClean = sanitize(brief.date, 30);
  if (brief.flexibleDate !== undefined) {
    lines.push(`Date: ${dateClean} (flexible: ${brief.flexibleDate ? "yes" : "no"})`);
  } else {
    lines.push(`Date: ${dateClean}`);
  }

  const locParts = [brief.venue, brief.city, brief.country]
    .map((p) => sanitize(p, 80))
    .filter(Boolean);
  if (locParts.length > 0) {
    lines.push(`Location: ${locParts.join(", ")}`);
  }

  lines.push(`Duration: ${sanitize(brief.duration, 40)}`);

  const deliverablesClean = brief.deliverables
    .map((d) => sanitize(d, 50))
    .filter(Boolean);
  if (deliverablesClean.length > 0) {
    lines.push(`Deliverables: ${deliverablesClean.join(", ")}`);
  }

  const refVideo = sanitize(brief.referenceVideo, 200);
  if (refVideo) {
    lines.push(`Reference: ${refVideo}`);
  }

  lines.push(`Name: ${sanitize(brief.name, 100)}`);

  const company = sanitize(brief.company, 100);
  if (company) {
    lines.push(`Company: ${company}`);
  }

  const email = sanitize(brief.email, 100);
  if (email) {
    lines.push(`Email: ${email}`);
  }

  const notes = sanitize(brief.notes, 1000);
  if (notes) {
    lines.push(`Notes: ${notes}`);
  }

  return fitToBudget(lines);
}

/**
 * Builds the wa.me URL with phone digits and URL-encoded message text.
 * wa.me requires digits only (country code, no plus, no leading zeros).
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhoneDigits(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct WhatsApp link without prefilled text (Audit Item 19 & Task P-15).
 */
export function buildWhatsAppDirectLink(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return `https://wa.me/${digits}`;
}

/**
 * Deep link URL for native app opening inside mobile in-app webviews (Audit Item 14).
 */
export function buildWhatsAppDeepLink(phone: string, message: string): string {
  const digits = normalizePhoneDigits(phone);
  return `whatsapp://send?phone=${digits}&text=${encodeURIComponent(message)}`;
}
