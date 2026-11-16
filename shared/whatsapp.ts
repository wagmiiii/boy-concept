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
  // Strip control characters (except basic space and punctuation)
  const cleaned = val.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
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

  const notes = sanitize(brief.notes, 1000);
  if (notes) {
    lines.push(`Notes: ${notes}`);
  }

  return lines.join("\n");
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
