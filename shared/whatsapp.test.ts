import { describe, expect, it } from "vitest";
import { siteConfig } from "./site-config";
import {
  BriefInput,
  buildWhatsAppDeepLink,
  buildWhatsAppDirectLink,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  MAX_MESSAGE_LENGTH,
  MAX_WA_URL_LENGTH,
  normalizePhoneDigits,
} from "./whatsapp";

describe("owner WhatsApp configuration (Audit Item 19)", () => {
  it("defines owner WhatsApp digits matching digits-only Nigerian E.164 without plus or leading zeros", () => {
    expect(siteConfig.ownerWhatsAppDigits).toMatch(/^234\d{10}$/);
    expect(siteConfig.ownerWhatsAppDigits.startsWith("+")).toBe(false);
    expect(siteConfig.ownerWhatsAppDigits.startsWith("0")).toBe(false);
  });
});

describe("normalizePhoneDigits", () => {
  it("converts local 0-prefixed Nigerian numbers to country code 234 without plus", () => {
    expect(normalizePhoneDigits("08012345678")).toBe("2348012345678");
  });

  it("strips plus signs, spaces, hyphens, and parentheses", () => {
    expect(normalizePhoneDigits("+234 801-234-5678")).toBe("2348012345678");
    expect(normalizePhoneDigits("+1 (555) 123-4567")).toBe("15551234567");
  });

  it("leaves already normalized numbers untouched", () => {
    expect(normalizePhoneDigits("2348012345678")).toBe("2348012345678");
  });
});

describe("buildWhatsAppMessage", () => {
  const sampleBrief: BriefInput = {
    ref: "AM-7K3Q5",
    projectType: "Wedding or event",
    date: "14 Feb 2027",
    flexibleDate: false,
    venue: "Eko Hotel",
    city: "Victoria Island",
    country: "Nigeria",
    duration: "Full day",
    deliverables: ["Highlight reel", "Drone coverage"],
    referenceVideo: "https://www.youtube.com/watch?v=FIXTUREvid1",
    name: "Ada and Tunde",
    company: "Studio 24",
    notes: "Please capture traditional wedding entrance.",
  };

  it("formats a full brief with ref per PRD section 7", () => {
    const msg = buildWhatsAppMessage(sampleBrief);
    expect(msg).toContain("Hello Alpha Movies, I just submitted a brief (Ref AM-7K3Q5).");
    expect(msg).toContain("Project: Wedding or event");
    expect(msg).toContain("Date: 14 Feb 2027 (flexible: no)");
    expect(msg).toContain("Location: Eko Hotel, Victoria Island, Nigeria");
    expect(msg).toContain("Duration: Full day");
    expect(msg).toContain("Deliverables: Highlight reel, Drone coverage");
    expect(msg).toContain("Reference: https://www.youtube.com/watch?v=FIXTUREvid1");
    expect(msg).toContain("Name: Ada and Tunde");
    expect(msg).toContain("Company: Studio 24");
    expect(msg).toContain("Notes: Please capture traditional wedding entrance.");
  });

  it("omits the Ref token when no ref is provided (Phase 0)", () => {
    const p0Brief: BriefInput = {
      projectType: "Commercial",
      date: "20 Nov 2026",
      duration: "Half day",
      deliverables: ["Highlight reel"],
      name: "Tola",
    };
    const msg = buildWhatsAppMessage(p0Brief);
    expect(msg).toContain("Hello Alpha Movies, I just submitted a brief.");
    expect(msg).not.toContain("Ref");
    expect(msg).toContain("Project: Commercial");
    expect(msg).toContain("Date: 20 Nov 2026");
    expect(msg).toContain("Duration: Half day");
    expect(msg).toContain("Deliverables: Highlight reel");
    expect(msg).toContain("Name: Tola");
  });

  it("preserves client email address when provided (Audit Item 2)", () => {
    const briefWithEmail: BriefInput = {
      projectType: "Commercial",
      date: "20 Nov 2026",
      duration: "Half day",
      deliverables: ["Highlight reel"],
      name: "Tola",
      email: "tola@example.com",
    };
    const msg = buildWhatsAppMessage(briefWithEmail);
    expect(msg).toContain("Name: Tola");
    expect(msg).toContain("Email: tola@example.com");
  });

  it("sanitizes dangerous control characters to prevent injection (Audit Item 5)", () => {
    const injectedBrief: BriefInput = {
      projectType: "Wedding\x00\x08",
      date: "2027-01-01",
      duration: "Full day",
      deliverables: ["Highlight reel\x1F"],
      name: "Ada\x07",
    };
    const msg = buildWhatsAppMessage(injectedBrief);
    expect(msg).not.toContain("\x00");
    expect(msg).not.toContain("\x08");
    expect(msg).not.toContain("\x1F");
    expect(msg).not.toContain("\x07");
    expect(msg).toContain("Project: Wedding");
    expect(msg).toContain("Name: Ada");
  });
});

describe("buildWhatsAppUrl and deep links", () => {
  it("builds a wa.me URL with normalized digits and URL-encoded message text", () => {
    const url = buildWhatsAppUrl("+234 801 234 5678", "Hello world!");
    expect(url).toBe("https://wa.me/2348012345678?text=Hello%20world!");
  });

  it("builds a direct wa.me link without text", () => {
    const url = buildWhatsAppDirectLink("08012345678");
    expect(url).toBe("https://wa.me/2348012345678");
  });

  it("builds a native deep link for in-app browser webview fallback (Audit Item 14)", () => {
    const url = buildWhatsAppDeepLink("+234 801 234 5678", "Hello!");
    expect(url).toBe("whatsapp://send?phone=2348012345678&text=Hello!");
  });
});

// Every field at the cap of sanitize() in whatsapp.ts, with the six deliverables the form offers.
describe("brief length budget (P-29)", () => {
  const fill = (ch: string, length: number) => ch.repeat(Math.ceil(length / ch.length)).slice(0, length);

  const maxedBrief: BriefInput = {
    ref: fill("A", 20),
    projectType: fill("P", 80),
    date: fill("D", 30),
    flexibleDate: true,
    venue: fill("V", 80),
    city: fill("C", 80),
    country: fill("N", 80),
    duration: fill("U", 40),
    deliverables: Array.from({ length: 6 }, () => fill("E", 50)),
    referenceVideo: fill("R", 200),
    name: fill("M", 100),
    company: fill("Y", 100),
    email: fill("I", 100),
    notes: fill("O", 1000),
  };

  it("holds a brief with every field maxed inside the message and link budgets", () => {
    const message = buildWhatsAppMessage(maxedBrief);
    const url = buildWhatsAppUrl(siteConfig.ownerWhatsAppDigits, message);
    expect(message.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(url.length).toBeLessThanOrEqual(MAX_WA_URL_LENGTH);
  });

  it("keeps the structured fields whole and shortens only the note", () => {
    const message = buildWhatsAppMessage(maxedBrief);
    expect(message).toContain("Project: P");
    expect(message).toContain("Date: D");
    expect(message).toContain("Location: V");
    expect(message).toContain("Name: M");
    expect(message).toContain("Email: I");
    expect(message).toContain("Notes: ");
    expect(message).not.toContain("O".repeat(50));
  });

  it("holds the link budget when the notes are emoji, which encode to twelve characters each", () => {
    const message = buildWhatsAppMessage({ ...maxedBrief, notes: "🎬".repeat(1000) });
    const url = buildWhatsAppUrl(siteConfig.ownerWhatsAppDigits, message);
    expect(message.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
    expect(url.length).toBeLessThanOrEqual(MAX_WA_URL_LENGTH);
  });

  it("survives a half-finished emoji, which would otherwise make encodeURIComponent throw", () => {
    const message = buildWhatsAppMessage({ ...maxedBrief, notes: `cut short \uD83C${fill("O", 990)}` });
    expect(() => buildWhatsAppUrl(siteConfig.ownerWhatsAppDigits, message)).not.toThrow();
    expect(message).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
  });

  it("does not truncate a brief that fits", () => {
    const brief: BriefInput = {
      ref: "AM-7K3Q5",
      projectType: "Wedding or event",
      date: "14 Feb 2027",
      flexibleDate: false,
      venue: "Eko Hotel",
      city: "Victoria Island",
      country: "Nigeria",
      duration: "Full day",
      deliverables: ["Highlight reel"],
      name: "Ada and Tunde",
      email: "ada@example.com",
      notes: "Please capture the traditional wedding entrance.",
    };
    expect(buildWhatsAppMessage(brief)).toBe(
      [
        "Hello Alpha Movies, I just submitted a brief (Ref AM-7K3Q5).",
        "Project: Wedding or event",
        "Date: 14 Feb 2027 (flexible: no)",
        "Location: Eko Hotel, Victoria Island, Nigeria",
        "Duration: Full day",
        "Deliverables: Highlight reel",
        "Name: Ada and Tunde",
        "Email: ada@example.com",
        "Notes: Please capture the traditional wedding entrance.",
      ].join("\n"),
    );
  });
});
