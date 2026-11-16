import { useState, useId } from "preact/hooks";
import { siteConfig } from "../../../shared/site-config";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  buildWhatsAppDeepLink,
  buildWhatsAppDirectLink,
  normalizePhoneDigits,
  type BriefInput,
} from "../../../shared/whatsapp";

interface FormState {
  eventDate: string;
  flexibleDate: boolean;
  secondDate: string;
  projectType: string;
  venue: string;
  city: string;
  country: string;
  duration: string;
  deliverables: string[];
  referenceVideo: string;
  describeInstead: boolean;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  notes: string;
  consent: boolean;
}

const PROJECT_TYPES = [
  "Festival",
  "Wedding or event",
  "Commercial or brand",
  "Documentary",
  "Other",
] as const;

const DURATIONS = [
  "Half day",
  "Full day",
  "Multiple days",
  "Not sure",
] as const;

const DELIVERABLES = [
  "Highlight reel",
  "Full film",
  "Same-day edit",
  "Drone coverage",
  "Social cuts",
  "Other",
] as const;

function getTodayString(): string {
  const now = new Date();
  // Africa/Lagos is UTC+1
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const lagosTime = new Date(utc + 3600000);
  return lagosTime.toISOString().split("T")[0] || "";
}

function getMaxDateString(): string {
  const now = new Date();
  const future = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  return future.toISOString().split("T")[0] || "";
}

function isWithin7Days(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date(getTodayString());
  const selected = new Date(dateStr);
  const diffDays = (selected.getTime() - today.getTime()) / (1000 * 3600 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

export default function EnquiryForm() {
  const idPrefix = useId();
  const today = getTodayString();
  const maxDate = getMaxDateString();

  const [form, setForm] = useState<FormState>({
    eventDate: "",
    flexibleDate: false,
    secondDate: "",
    projectType: PROJECT_TYPES[1], // default "Wedding or event"
    venue: "",
    city: "",
    country: "Nigeria",
    duration: DURATIONS[1], // default "Full day"
    deliverables: ["Highlight reel"],
    referenceVideo: "",
    describeInstead: false,
    name: "",
    company: "",
    whatsapp: "",
    email: "",
    notes: "",
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedBrief, setSubmittedBrief] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [clientRequestId] = useState(() =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  const trackEvent = (name: string, params?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", name, params);
    }
  };

  const directWhatsAppUrl = buildWhatsAppDirectLink(siteConfig.ownerWhatsAppDigits);

  const toggleDeliverable = (item: string) => {
    setForm((prev) => {
      const exists = prev.deliverables.includes(item);
      const next = exists
        ? prev.deliverables.filter((d) => d !== item)
        : [...prev.deliverables, item];
      return { ...prev, deliverables: next };
    });
    if (errors.deliverables) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.deliverables;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    // Silently reject bot submissions if hidden honeypot is populated (Audit Item 5)
    if (honeypot) return false;

    if (!form.eventDate) {
      nextErrors.eventDate = "Please choose an event date.";
    } else if (form.eventDate < today || form.eventDate > maxDate) {
      nextErrors.eventDate = "Event date must be between today and 24 months out.";
    }

    if (form.secondDate && (form.secondDate < form.eventDate || form.secondDate > maxDate)) {
      nextErrors.secondDate = "Second date must be on or after the first date.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "Please enter the city.";
    }

    if (!form.country.trim()) {
      nextErrors.country = "Please enter the country.";
    }

    if (form.deliverables.length === 0) {
      nextErrors.deliverables = "Select at least one deliverable.";
    }

    if (!form.describeInstead && !form.referenceVideo.trim()) {
      nextErrors.referenceVideo = "Please provide a reference video link or check describe instead.";
    }

    if (form.describeInstead && !form.notes.trim()) {
      nextErrors.notes = "Please describe your vision in the notes field.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.whatsapp.trim() && !form.email.trim()) {
      nextErrors.contact = "Provide either a WhatsApp number or an email address.";
    } else {
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        nextErrors.email = "Please enter a valid email address.";
      }
      if (form.whatsapp.trim() && normalizePhoneDigits(form.whatsapp).length < 10) {
        nextErrors.whatsapp = "Please enter a valid phone number with area/country code.";
      }
    }

    if (!form.consent) {
      nextErrors.consent = "You must agree to be contacted about this enquiry.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;

    const briefInput: BriefInput = {
      projectType: form.projectType,
      date: form.eventDate + (form.secondDate ? ` to ${form.secondDate}` : ""),
      flexibleDate: form.flexibleDate,
      venue: form.venue.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      duration: form.duration,
      deliverables: form.deliverables,
      referenceVideo: form.describeInstead ? undefined : form.referenceVideo.trim(),
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    const message = buildWhatsAppMessage(briefInput);
    setSubmittedBrief(message);

    // Track GA4 conversion event (Task P-16, PRD FR-21, Audit Item 19)
    trackEvent("form_submit", { project_type: form.projectType });

    // Asynchronously dispatch background POST to persist lead in D1 & send alert email (Audit Item 1).
    // Rule 5: A backend failure never blocks the WhatsApp handoff.
    const payload = {
      ...briefInput,
      clientRequestId,
      website: honeypot,
    };

    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Backend failure is logged in network and never blocks WhatsApp handoff
    });

    window.scrollTo({ top: (document.getElementById("enquiry")?.offsetTop || 0) - 70, behavior: "smooth" });
  };

  const handleCopy = async () => {
    if (!submittedBrief) return;
    try {
      await navigator.clipboard.writeText(submittedBrief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is blocked
      setCopied(true);
    }
  };

  // Confirmation screen replaces form on successful submission
  if (submittedBrief) {
    const waUrl = buildWhatsAppUrl(siteConfig.ownerWhatsAppDigits, submittedBrief);
    const deepLinkUrl = buildWhatsAppDeepLink(siteConfig.ownerWhatsAppDigits, submittedBrief);

    return (
      <div class="card flex flex-col gap-6 p-6 md:p-8">
        <div class="flex flex-col gap-2">
          <p class="eyebrow">Handoff ready</p>
          <h3 class="font-display text-h3 text-text">Brief received</h3>
          <p class="text-body text-text-2">
            Your brief is formatted and ready. Click below to open WhatsApp with your pre-filled brief
            and message Emmanuel directly.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_web" })}
            class="btn-primary w-full md:w-auto md:self-start"
          >
            Open WhatsApp
          </a>

          <a
            href={deepLinkUrl}
            onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_deeplink" })}
            class="text-small text-gold underline underline-offset-4 hover:text-gold-bright"
          >
            Opening inside Instagram or TikTok? Tap here for native app handoff
          </a>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-small font-semibold text-text-2">Copyable brief text</span>
            <button
              type="button"
              onClick={handleCopy}
              class="btn-secondary h-11 px-4 text-small"
            >
              {copied ? "Copied to clipboard!" : "Copy brief message"}
            </button>
          </div>

          <div class="rounded-card border border-line bg-surface-1 p-4">
            <pre class="font-sans text-small whitespace-pre-wrap text-text-2">
              {submittedBrief}
            </pre>
          </div>
        </div>

        <div class="border-t border-line pt-4 text-small text-text-muted">
          <p>
            Already booked with us?{" "}
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_direct" })}
              class="font-semibold text-gold underline hover:text-gold-bright"
            >
              Message directly on WhatsApp
            </a>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmittedBrief(null);
            setErrors({});
          }}
          class="btn-secondary w-full md:w-auto md:self-start text-small"
        >
          Submit another brief
        </button>
      </div>
    );
  }

  const showShortNotice = isWithin7Days(form.eventDate);

  return (
    <form onSubmit={handleSubmit} noValidate class="card flex flex-col gap-6 p-6 md:p-8">
      {/* Starting price notice (FR-10) */}
      <div class="flex flex-col gap-1 border-b border-line pb-4">
        <p class="text-body text-text-2">
          Packages start from <span class="font-semibold text-gold">₦[amount]</span>
        </p>
        <p class="text-small text-text-muted">
          Fill in your details below. You will be able to review the brief and send it on WhatsApp with one click.
        </p>
      </div>

      {/* Field 1: Event date (First field per ESSENTIALS rule 2) */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-eventDate`} class="text-small font-semibold text-text-2">
          Event date <span class="text-gold">*</span>
        </label>
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            id={`${idPrefix}-eventDate`}
            type="date"
            min={today}
            max={maxDate}
            value={form.eventDate}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setForm((p) => ({ ...p, eventDate: val }));
              if (errors.eventDate) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.eventDate;
                  return next;
                });
              }
            }}
            class={`h-13 rounded-input border bg-surface-2 px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2 ${
              errors.eventDate ? "border-error" : "border-line-input"
            }`}
          />

          <label class="flex items-center gap-2 text-small text-text-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.flexibleDate}
              onChange={(e) => setForm((p) => ({ ...p, flexibleDate: (e.target as HTMLInputElement).checked }))}
              class="h-5 w-5 rounded border-line-input accent-gold"
            />
            Dates are flexible
          </label>
        </div>

        {errors.eventDate && (
          <p class="text-small text-error">{errors.eventDate}</p>
        )}

        {showShortNotice && (
          <p class="text-small text-text-2 flex items-center gap-1.5">
            <span class="inline-block h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
            Short notice, we will confirm availability.
          </p>
        )}
      </div>

      {/* Field 2: Second date or end date (optional) */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-secondDate`} class="text-small font-semibold text-text-2">
          Second date or end date <span class="text-text-muted font-normal">(optional — for multi-day shoots or traditional/white wedding pairs)</span>
        </label>
        <input
          id={`${idPrefix}-secondDate`}
          type="date"
          min={form.eventDate || today}
          max={maxDate}
          value={form.secondDate}
          onInput={(e) => setForm((p) => ({ ...p, secondDate: (e.target as HTMLInputElement).value }))}
          class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
        />
      </div>

      {/* Field 3: Project type */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-projectType`} class="text-small font-semibold text-text-2">
          Project type <span class="text-gold">*</span>
        </label>
        <select
          id={`${idPrefix}-projectType`}
          value={form.projectType}
          onChange={(e) => setForm((p) => ({ ...p, projectType: (e.target as HTMLSelectElement).value }))}
          class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
        >
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type} class="bg-surface-2 text-text">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Field 4: Venue, city, country */}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-venue`} class="text-small font-semibold text-text-2">
            Venue <span class="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-venue`}
            type="text"
            placeholder="e.g. Landmark Centre"
            value={form.venue}
            onInput={(e) => setForm((p) => ({ ...p, venue: (e.target as HTMLInputElement).value }))}
            class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-city`} class="text-small font-semibold text-text-2">
            City <span class="text-gold">*</span>
          </label>
          <input
            id={`${idPrefix}-city`}
            type="text"
            placeholder="e.g. Lagos"
            value={form.city}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setForm((p) => ({ ...p, city: val }));
              if (errors.city) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.city;
                  return next;
                });
              }
            }}
            class={`h-13 rounded-input border bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2 ${
              errors.city ? "border-error" : "border-line-input"
            }`}
          />
          {errors.city && <p class="text-small text-error">{errors.city}</p>}
        </div>

        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-country`} class="text-small font-semibold text-text-2">
            Country <span class="text-gold">*</span>
          </label>
          <input
            id={`${idPrefix}-country`}
            type="text"
            placeholder="e.g. Nigeria"
            value={form.country}
            onInput={(e) => setForm((p) => ({ ...p, country: (e.target as HTMLInputElement).value }))}
            class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
          />
        </div>
      </div>

      {/* Field 5: Duration */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-duration`} class="text-small font-semibold text-text-2">
          Duration <span class="text-gold">*</span>
        </label>
        <select
          id={`${idPrefix}-duration`}
          value={form.duration}
          onChange={(e) => setForm((p) => ({ ...p, duration: (e.target as HTMLSelectElement).value }))}
          class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
        >
          {DURATIONS.map((dur) => (
            <option key={dur} value={dur} class="bg-surface-2 text-text">
              {dur}
            </option>
          ))}
        </select>
      </div>

      {/* Field 6: Deliverables (multi-select checkboxes) */}
      <div class="flex flex-col gap-2">
        <span class="text-small font-semibold text-text-2">
          Deliverables <span class="text-gold">* (select at least one)</span>
        </span>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          {DELIVERABLES.map((item) => {
            const isChecked = form.deliverables.includes(item);
            return (
              <label
                key={item}
                class={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-input border p-3 text-small transition-colors ${
                  isChecked
                    ? "border-gold bg-surface-3 text-text"
                    : "border-line-input bg-surface-2 text-text-2 hover:border-gold"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDeliverable(item)}
                  class="h-5 w-5 rounded border-line-input accent-gold"
                />
                {item}
              </label>
            );
          })}
        </div>
        {errors.deliverables && <p class="text-small text-error">{errors.deliverables}</p>}
      </div>

      {/* Field 7: Reference video */}
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-refVideo`} class="text-small font-semibold text-text-2">
            Reference video {!form.describeInstead && <span class="text-gold">*</span>}
          </label>
          <label class="flex items-center gap-2 text-small text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.describeInstead}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setForm((p) => ({ ...p, describeInstead: checked }));
                if (checked && errors.referenceVideo) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.referenceVideo;
                    return next;
                  });
                }
              }}
              class="h-4 w-4 rounded border-line-input accent-gold"
            />
            I will describe it instead
          </label>
        </div>

        {!form.describeInstead && (
          <input
            id={`${idPrefix}-refVideo`}
            type="url"
            placeholder="Link to a video you like (YouTube, Vimeo, Instagram)"
            value={form.referenceVideo}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setForm((p) => ({ ...p, referenceVideo: val }));
              if (errors.referenceVideo) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.referenceVideo;
                  return next;
                });
              }
            }}
            class={`h-13 rounded-input border bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2 ${
              errors.referenceVideo ? "border-error" : "border-line-input"
            }`}
          />
        )}
        {errors.referenceVideo && <p class="text-small text-error">{errors.referenceVideo}</p>}
      </div>

      {/* Field 8: Name */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-name`} class="text-small font-semibold text-text-2">
          Your name <span class="text-gold">*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          placeholder="e.g. Ada and Tunde / Folake Adeyemi"
          value={form.name}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            setForm((p) => ({ ...p, name: val }));
            if (errors.name) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.name;
                return next;
              });
            }
          }}
          class={`h-13 rounded-input border bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2 ${
            errors.name ? "border-error" : "border-line-input"
          }`}
        />
        {errors.name && <p class="text-small text-error">{errors.name}</p>}
      </div>

      {/* Field 9: Company or agency */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-company`} class="text-small font-semibold text-text-2">
          Company or agency <span class="text-text-muted font-normal">(optional — for brand shoots & agencies)</span>
        </label>
        <input
          id={`${idPrefix}-company`}
          type="text"
          placeholder="e.g. Studio Red / Brand Name"
          value={form.company}
          onInput={(e) => setForm((p) => ({ ...p, company: (e.target as HTMLInputElement).value }))}
          class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
        />
      </div>

      {/* Contact info: WhatsApp number OR Email (Fields 10 & 11) */}
      <div class="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4">
        <div>
          <span class="text-small font-semibold text-text-2">
            Contact information <span class="text-gold">* (provide at least one)</span>
          </span>
          <p class="text-small text-text-muted">
            We use this only to follow up on your enquiry. When you send the brief on WhatsApp, we will reply to that number.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-whatsapp`} class="text-small font-semibold text-text-2">
              WhatsApp number
            </label>
            <input
              id={`${idPrefix}-whatsapp`}
              type="tel"
              placeholder="e.g. 08012345678 or +234..."
              value={form.whatsapp}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setForm((p) => ({ ...p, whatsapp: val }));
                if (errors.contact) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.contact;
                    delete next.whatsapp;
                    return next;
                  });
                }
              }}
              class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
            />
            {errors.whatsapp && <p class="text-small text-error">{errors.whatsapp}</p>}
          </div>

          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-email`} class="text-small font-semibold text-text-2">
              Email address
            </label>
            <input
              id={`${idPrefix}-email`}
              type="email"
              placeholder="e.g. you@example.com"
              value={form.email}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setForm((p) => ({ ...p, email: val }));
                if (errors.contact || errors.email) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.contact;
                    delete next.email;
                    return next;
                  });
                }
              }}
              class="h-13 rounded-input border border-line-input bg-surface-2 px-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2"
            />
            {errors.email && <p class="text-small text-error">{errors.email}</p>}
          </div>
        </div>
        {errors.contact && <p class="text-small text-error">{errors.contact}</p>}
      </div>

      {/* Field 12: Notes */}
      <div class="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-notes`} class="text-small font-semibold text-text-2">
          Notes {form.describeInstead ? <span class="text-gold">*</span> : <span class="text-text-muted font-normal">(optional, max 1000 characters)</span>}
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          rows={4}
          maxLength={1000}
          placeholder={form.describeInstead ? "Describe your creative vision, references, or specific moments to capture..." : "Any additional details or schedule notes..."}
          value={form.notes}
          onInput={(e) => {
            const val = (e.target as HTMLTextAreaElement).value;
            setForm((p) => ({ ...p, notes: val }));
            if (errors.notes) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.notes;
                return next;
              });
            }
          }}
          class={`rounded-input border bg-surface-2 p-4 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-gold-bright focus-visible:outline-offset-2 ${
            errors.notes ? "border-error" : "border-line-input"
          }`}
        />
        {errors.notes && <p class="text-small text-error">{errors.notes}</p>}
      </div>

      {/* Field 13: Consent checkbox */}
      <div class="flex flex-col gap-1">
        <label class="flex items-start gap-3 cursor-pointer text-small text-text-2">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              setForm((p) => ({ ...p, consent: checked }));
              if (checked && errors.consent) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.consent;
                  return next;
                });
              }
            }}
            class="mt-1 h-5 w-5 rounded border-line-input accent-gold"
          />
          <span>
            I agree to be contacted about this enquiry in accordance with the{" "}
            <a href="/privacy" target="_blank" class="text-gold underline underline-offset-2 hover:text-gold-bright">
              Privacy Notice
            </a>.
          </span>
        </label>
        {errors.consent && <p class="text-small text-error">{errors.consent}</p>}
      </div>

      {/* Honeypot field (Audit Item 5): Hidden from users, traps automated form-scraping bots */}
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Leave this field blank</label>
        <input
          id={`${idPrefix}-website`}
          type="text"
          name="website"
          value={honeypot}
          autoComplete="off"
          tabIndex={-1}
          onInput={(e) => setHoneypot((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Submit row & Response-time promise (FR-15) */}
      <div class="flex flex-col gap-3 pt-2">
        <button type="submit" class="btn-primary w-full md:w-auto md:self-start">
          Send brief
        </button>

        <p class="text-small text-text-2">
          We review briefs promptly and reply with availability and confirmed pricing.
        </p>

        <p class="text-small text-text-muted">
          Prefer to talk first?{" "}
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-gold underline hover:text-gold-bright"
          >
            Message directly on WhatsApp
          </a>.
        </p>
      </div>
    </form>
  );
}
