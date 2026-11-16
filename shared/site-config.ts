// Hard rule (ESSENTIALS rule 4 & 15, D16):
// 4. wa.me numbers are digits only: no plus, no leading zeros.
// 15. The owner WhatsApp number is defined only in shared/site-config.ts.
// Web and worker import it from here.

export const siteConfig = {
  // Owner WhatsApp digits confirmed for Alpha Movies / Boy Concept (Q5 / C-8).
  // Nigerian country code 234 followed by 10 digits (digits only, no plus, no leading zero).
  ownerWhatsAppDigits: "2348027465901",
  siteOrigin: "https://boyconcept.com",
} as const;
