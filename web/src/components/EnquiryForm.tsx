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

const DURATIONS = ["Half day", "Full day", "Multiple days", "Not sure"] as const;

const DELIVERABLES = [
  "Highlight reel",
  "Full film",
  "Same-day edit",
  "Drone coverage",
  "Social cuts",
  "Other",
] as const;

const fieldClass = (invalid: boolean) => `field ${invalid ? "field-error" : ""}`;

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

function SectionHead({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note?: string;
}) {
  return (
    <div class="flex flex-col gap-1.5 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div class="flex items-baseline gap-3">
        <span class="font-mono text-small text-gold">{number}</span>
        <h3 class="text-h4 font-semibold text-text">{title}</h3>
      </div>
      {note ? <p class="pl-8 text-small text-text-muted">{note}</p> : null}
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  return message ? (
    <p class="text-small text-error" role="alert">
      {message}
    </p>
  ) : null;
}

export default function EnquiryForm() {
  const idPrefix = useId();
  const today = getTodayString();
  const maxDate = getMaxDateString();

  const [form, setForm] = useState<FormState>({
    eventDate: "",
    flexibleDate: false,
    secondDate: "",
    projectType: PROJECT_TYPES[1],
    venue: "",
    city: "",
    country: "Nigeria",
    duration: DURATIONS[1],
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
      : `req_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  );

  const trackEvent = (name: string, params?: Record<string, unknown>) => {
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function"
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", name, params);
    }
  };

  const directWhatsAppUrl = buildWhatsAppDirectLink(siteConfig.ownerWhatsAppDigits);

  const clearError = (key: string) => {
    if (!errors[key] && !(key === "whatsapp" || key === "email") ) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "whatsapp" || key === "email") delete next.contact;
      return next;
    });
  };

  const toggleDeliverable = (item: string) => {
    setForm((prev) => {
      const exists = prev.deliverables.includes(item);
      const next = exists ? prev.deliverables.filter((d) => d !== item) : [...prev.deliverables, item];
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

    // Silently reject bot submissions if the hidden honeypot is populated.
    if (honeypot) return false;

    if (!form.eventDate) {
      nextErrors.eventDate = "Please choose an event date.";
    } else if (form.eventDate < today || form.eventDate > maxDate) {
      nextErrors.eventDate = "Event date must be between today and 24 months out.";
    }

    if (form.secondDate && (form.secondDate < form.eventDate || form.secondDate > maxDate)) {
      nextErrors.secondDate = "Second date must be on or after the first date.";
    }

    if (!form.city.trim()) nextErrors.city = "Please enter the city.";
    if (!form.country.trim()) nextErrors.country = "Please enter the country.";
    if (form.deliverables.length === 0) nextErrors.deliverables = "Select at least one deliverable.";

    if (!form.describeInstead && !form.referenceVideo.trim()) {
      nextErrors.referenceVideo = "Please provide a reference video link or check describe instead.";
    }
    if (form.describeInstead && !form.notes.trim()) {
      nextErrors.notes = "Please describe your vision in the notes field.";
    }
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";

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

    if (!form.consent) nextErrors.consent = "You must agree to be contacted about this enquiry.";

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
    trackEvent("form_submit", { project_type: form.projectType });

    // A backend failure never blocks the WhatsApp handoff (ESSENTIALS rule 5).
    const payload = { ...briefInput, clientRequestId, website: honeypot };
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);

    const target = document.getElementById("enquiry-form-section");
    window.scrollTo({ top: (target?.offsetTop || 0) - 96, behavior: "smooth" });
  };

  const handleCopy = async () => {
    if (!submittedBrief) return;
    try {
      await navigator.clipboard.writeText(submittedBrief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  if (submittedBrief) {
    const waUrl = buildWhatsAppUrl(siteConfig.ownerWhatsAppDigits, submittedBrief);
    const deepLinkUrl = buildWhatsAppDeepLink(siteConfig.ownerWhatsAppDigits, submittedBrief);

    return (
      <div class="rounded-panel border border-line-strong bg-surface-1 p-6 md:p-10">
        <div class="flex flex-col gap-6 border-b border-line pb-8">
          <span class="flex size-14 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold">
            <svg class="size-6 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <div class="flex flex-col gap-3">
            <p class="eyebrow">Ready to send</p>
            <h2 class="text-h2 font-semibold text-text">
              Your brief is <span class="display-italic text-gold">written.</span>
            </h2>
            <p class="max-w-[52ch] text-body text-text-2">
              One last step, and it stays in your hands: open WhatsApp and press send. Nothing has
              been sent yet.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-4 py-8">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-handoff="whatsapp"
            onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_web" })}
            class="btn-primary w-full md:w-auto"
          >
            Open WhatsApp and send
            <svg class="size-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>

          <a
            href={deepLinkUrl}
            onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_deeplink" })}
            class="text-small text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-bright"
          >
            In the Instagram or TikTok in-app browser? Tap for a direct app handoff.
          </a>
        </div>

        <div class="flex flex-col gap-3 border-t border-line pt-6">
          <div class="flex items-center justify-between gap-3">
            <span class="text-eyebrow uppercase tracking-[0.18em] text-text-muted">Your message</span>
            <button type="button" onClick={handleCopy} class="btn-secondary min-h-11 px-4 py-2 text-small">
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
          <div class="rounded-card border border-line bg-bg p-4 md:p-5">
            <pre class="whitespace-pre-wrap font-sans text-small leading-relaxed text-text-2">
              {submittedBrief}
            </pre>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-small text-text-muted md:flex-row md:items-center md:justify-between">
          <p>
            Already booked?{" "}
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_tap", { source: "confirmation_direct" })}
              class="font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-bright"
            >
              Message directly
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmittedBrief(null);
              setErrors({});
            }}
            class="min-h-11 self-start text-small text-text-2 underline decoration-line underline-offset-4 transition-colors hover:text-gold md:self-auto"
          >
            Start another brief
          </button>
        </div>
      </div>
    );
  }

  const showShortNotice = isWithin7Days(form.eventDate);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      class="flex flex-col gap-8 rounded-panel border border-line-strong bg-surface-1 p-6 md:p-10"
    >
      <div class="flex flex-col gap-2 rounded-card border border-line bg-bg/50 p-5 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-1">
          <p class="text-small text-text-2">
            Commission packages start from <span class="font-semibold text-gold">₦[amount]</span>
          </p>
          <p class="text-small text-text-muted">Every brief gets its own quote.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-text-muted">
          <span class="size-1.5 rounded-full bg-gold"></span>
          Replies from a person
        </span>
      </div>

      <fieldset class="flex flex-col gap-5">
        <legend class="sr-only">Date and place</legend>
        <SectionHead number="01" title="Date and place" note="The date decides everything that follows." />

        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-eventDate`} class="field-label">
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
                clearError("eventDate");
              }}
              class={`${fieldClass(Boolean(errors.eventDate))} md:max-w-[260px]`}
            />

            <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-small text-text-2 select-none">
              <input
                type="checkbox"
                checked={form.flexibleDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, flexibleDate: (e.target as HTMLInputElement).checked }))
                }
                class="size-5 rounded border-line-input accent-gold"
              />
              Dates are flexible
            </label>
          </div>
          <ErrorText message={errors.eventDate} />
          {showShortNotice ? (
            <p class="flex items-center gap-2 text-small text-text-2">
              <span class="size-2 rounded-full bg-gold" aria-hidden="true" />
              Short notice. We will confirm availability promptly.
            </p>
          ) : null}
        </div>

        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-secondDate`} class="field-label">
            Second date or end date <span class="font-normal text-text-muted">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-secondDate`}
            type="date"
            min={form.eventDate || today}
            max={maxDate}
            value={form.secondDate}
            onInput={(e) => setForm((p) => ({ ...p, secondDate: (e.target as HTMLInputElement).value }))}
            class={`${fieldClass(Boolean(errors.secondDate))} md:max-w-[260px]`}
          />
          <ErrorText message={errors.secondDate} />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-venue`} class="field-label">
              Venue <span class="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id={`${idPrefix}-venue`}
              type="text"
              placeholder="Landmark Centre"
              value={form.venue}
              onInput={(e) => setForm((p) => ({ ...p, venue: (e.target as HTMLInputElement).value }))}
              class="field"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-city`} class="field-label">
              City <span class="text-gold">*</span>
            </label>
            <input
              id={`${idPrefix}-city`}
              type="text"
              placeholder="Lagos"
              value={form.city}
              onInput={(e) => {
                setForm((p) => ({ ...p, city: (e.target as HTMLInputElement).value }));
                clearError("city");
              }}
              class={fieldClass(Boolean(errors.city))}
            />
            <ErrorText message={errors.city} />
          </div>

          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-country`} class="field-label">
              Country <span class="text-gold">*</span>
            </label>
            <input
              id={`${idPrefix}-country`}
              type="text"
              placeholder="Nigeria"
              value={form.country}
              onInput={(e) => {
                setForm((p) => ({ ...p, country: (e.target as HTMLInputElement).value }));
                clearError("country");
              }}
              class={fieldClass(Boolean(errors.country))}
            />
            <ErrorText message={errors.country} />
          </div>
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-5">
        <legend class="sr-only">The film</legend>
        <SectionHead number="02" title="The film" note="What it covers and what you want back." />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-projectType`} class="field-label">
              Project type <span class="text-gold">*</span>
            </label>
            <select
              id={`${idPrefix}-projectType`}
              value={form.projectType}
              onChange={(e) => setForm((p) => ({ ...p, projectType: (e.target as HTMLSelectElement).value }))}
              class="field"
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-duration`} class="field-label">
              Duration <span class="text-gold">*</span>
            </label>
            <select
              id={`${idPrefix}-duration`}
              value={form.duration}
              onChange={(e) => setForm((p) => ({ ...p, duration: (e.target as HTMLSelectElement).value }))}
              class="field"
            >
              {DURATIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <span class="field-label">
            Deliverables <span class="text-gold">*</span>{" "}
            <span class="font-normal text-text-muted">Select all that apply</span>
          </span>
          <div class="flex flex-wrap gap-2">
            {DELIVERABLES.map((item) => {
              const isChecked = form.deliverables.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => toggleDeliverable(item)}
                  class="chip"
                  data-active={isChecked ? "true" : "false"}
                >
                  {isChecked ? (
                    <svg class="mr-1.5 size-3.5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                  {item}
                </button>
              );
            })}
          </div>
          <ErrorText message={errors.deliverables} />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={`${idPrefix}-refVideo`} class="field-label">
              Reference video {!form.describeInstead ? <span class="text-gold">*</span> : null}
            </label>
            <label class="flex min-h-11 cursor-pointer items-center gap-2 text-small text-text-muted select-none">
              <input
                type="checkbox"
                checked={form.describeInstead}
                onChange={(e) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  setForm((p) => ({ ...p, describeInstead: checked }));
                  if (checked) clearError("referenceVideo");
                }}
                class="size-4 rounded border-line-input accent-gold"
              />
              I will describe it instead
            </label>
          </div>

          {!form.describeInstead ? (
            <input
              id={`${idPrefix}-refVideo`}
              type="url"
              placeholder="A link to a film you like (YouTube, Vimeo, Instagram)"
              value={form.referenceVideo}
              onInput={(e) => {
                setForm((p) => ({ ...p, referenceVideo: (e.target as HTMLInputElement).value }));
                clearError("referenceVideo");
              }}
              class={fieldClass(Boolean(errors.referenceVideo))}
            />
          ) : null}
          <ErrorText message={errors.referenceVideo} />
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-5">
        <legend class="sr-only">How to reach you</legend>
        <SectionHead number="03" title="How to reach you" note="One channel is enough. We reply the way you ask." />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-name`} class="field-label">
              Your name <span class="text-gold">*</span>
            </label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              placeholder="Ada and Tunde"
              value={form.name}
              onInput={(e) => {
                setForm((p) => ({ ...p, name: (e.target as HTMLInputElement).value }));
                clearError("name");
              }}
              class={fieldClass(Boolean(errors.name))}
            />
            <ErrorText message={errors.name} />
          </div>

          <div class="flex flex-col gap-2">
            <label htmlFor={`${idPrefix}-company`} class="field-label">
              Company or agency <span class="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id={`${idPrefix}-company`}
              type="text"
              placeholder="Studio or brand"
              value={form.company}
              onInput={(e) => setForm((p) => ({ ...p, company: (e.target as HTMLInputElement).value }))}
              class="field"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 rounded-card border border-line bg-bg/50 p-5">
          <div>
            <p class="field-label">
              Contact <span class="text-gold">*</span>{" "}
              <span class="font-normal text-text-muted">Provide at least one</span>
            </p>
            <p class="mt-1 text-small text-text-muted">
              Used only to follow up on this enquiry.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label htmlFor={`${idPrefix}-whatsapp`} class="field-label">
                WhatsApp number
              </label>
              <input
                id={`${idPrefix}-whatsapp`}
                type="tel"
                placeholder="0801 234 5678"
                value={form.whatsapp}
                onInput={(e) => {
                  setForm((p) => ({ ...p, whatsapp: (e.target as HTMLInputElement).value }));
                  clearError("whatsapp");
                }}
                class={fieldClass(Boolean(errors.whatsapp))}
              />
              <ErrorText message={errors.whatsapp} />
            </div>

            <div class="flex flex-col gap-2">
              <label htmlFor={`${idPrefix}-email`} class="field-label">
                Email
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onInput={(e) => {
                  setForm((p) => ({ ...p, email: (e.target as HTMLInputElement).value }));
                  clearError("email");
                }}
                class={fieldClass(Boolean(errors.email))}
              />
              <ErrorText message={errors.email} />
            </div>
          </div>
          <ErrorText message={errors.contact} />
        </div>

        <div class="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-notes`} class="field-label">
            Notes{" "}
            {form.describeInstead ? (
              <span class="text-gold">*</span>
            ) : (
              <span class="font-normal text-text-muted">(optional, 1000 characters)</span>
            )}
          </label>
          <textarea
            id={`${idPrefix}-notes`}
            rows={4}
            maxLength={1000}
            placeholder={
              form.describeInstead
                ? "Describe the feeling, the references, the moments that matter."
                : "Anything else we should know about the day."
            }
            value={form.notes}
            onInput={(e) => {
              setForm((p) => ({ ...p, notes: (e.target as HTMLTextAreaElement).value }));
              clearError("notes");
            }}
            class={fieldClass(Boolean(errors.notes))}
          />
          <ErrorText message={errors.notes} />
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex cursor-pointer items-start gap-3 text-small text-text-2 select-none">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => {
                setForm((p) => ({ ...p, consent: (e.target as HTMLInputElement).checked }));
                clearError("consent");
              }}
              class="mt-0.5 size-5 rounded border-line-input accent-gold"
            />
            <span>
              I agree to be contacted about this enquiry in line with the{" "}
              <a href="/privacy" target="_blank" class="text-gold underline decoration-gold/40 underline-offset-2 hover:text-gold-bright">
                privacy notice
              </a>
              .
            </span>
          </label>
          <ErrorText message={errors.consent} />
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, tempting to bots. */}
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

      <div class="flex flex-col gap-4 border-t border-line pt-6">
        <button type="submit" class="btn-primary w-full text-base md:w-auto md:self-start">
          Build the WhatsApp brief
          <svg class="size-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        <p class="text-small text-text-2">
          Nothing is sent yet. You will see the message and press send yourself on WhatsApp.
        </p>

        <p class="text-small text-text-muted">
          Prefer to talk first?{" "}
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-bright"
          >
            Message directly on WhatsApp
          </a>
          .
        </p>
      </div>
    </form>
  );
}
