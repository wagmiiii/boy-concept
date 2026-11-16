import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";
import type { WorkerEnv } from "./config";

type Bindings = WorkerEnv & {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Security headers for all /api/* routes (D21: _headers applies only to static assets)
app.use(
  "*",
  secureHeaders({
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  })
);

// Origin & CSRF check middleware for mutating API requests (Audit Item 3 & Task B-5)
app.use("/api/*", async (c, next) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(c.req.method)) {
    const secFetchSite = c.req.header("Sec-Fetch-Site");
    if (secFetchSite === "cross-site") {
      return c.json({ error: { code: "FORBIDDEN_ORIGIN" } }, 403);
    }

    const origin = c.req.header("Origin");
    const allowed = c.env.ALLOWED_ORIGIN || "https://boyconcept.com";
    if (origin && origin !== allowed) {
      const isAllowedOrigin =
        origin.endsWith(".workers.dev") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");
      if (!isAllowedOrigin) {
        return c.json({ error: { code: "FORBIDDEN_ORIGIN" } }, 403);
      }
    }
  }
  await next();
});

/**
 * Validates Cloudflare Turnstile bot challenge token (Audit Item 4 & Task B-5)
 */
export async function verifyTurnstileToken(
  secretKey: string | undefined,
  token: string,
  remoteIp?: string,
  isProduction = false
): Promise<boolean> {
  if (!secretKey) {
    // In production, missing secret key must fail closed to prevent spam bot flooding.
    // In local dev without secret key, bypass verification.
    return !isProduction;
  }
  if (!token) return false;

  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  }).catch(() => null);

  if (!res || !res.ok) return false;
  const result = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return result?.success === true;
}

const enquiryBody = z.object({
  clientRequestId: z.string().min(1).max(100),
  projectType: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  flexibleDate: z.boolean().optional(),
  venue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  duration: z.string().max(100),
  deliverables: z.array(z.string().max(100)),
  referenceVideo: z.string().max(500).optional(),
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  whatsapp: z.string().max(50).optional(),
  email: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  website: z.string().max(200).optional(), // Honeypot field (Audit Item 5)
});

const spikeBody = z.object({
  name: z.string().min(1).max(200),
});

app.get("/api/ping", (c) =>
  c.json({ ok: true, from: "hono", servedAt: new Date().toISOString() })
);

app.post("/api/enquiries", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = enquiryBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION" } }, 400);
  }

  // Honeypot check: reject bot if hidden website input was populated (Audit Item 5)
  if (parsed.data.website) {
    return c.json({ error: { code: "BOT" } }, 400);
  }

  // Phase 0 / Early Phase 1: If DB is not yet provisioned, log and return 201 per Rule 5.
  // Rule 5: A backend failure or missing DB never blocks the WhatsApp handoff.
  return c.json({ ok: true, ref: null }, 201);
});

app.post("/api/spike", async (c) => {
  const body = await c.req
    .json()
    .catch(() => null);
  const parsed = spikeBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION" } }, 400);
  }
  return c.json({ ok: true, echo: parsed.data.name });
});

// Reaches only for an unmatched /api path: run_worker_first is scoped to /api/*.
// Returns a static error object without reflecting unvalidated client URL paths (Audit Item 2).
app.all("*", (c) =>
  c.json({ error: { code: "NOT_HANDLED" } }, 404)
);

export default {
  fetch: app.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: Bindings,
    ctx: ExecutionContext
  ) {
    if (env.DB) {
      // 90-day NDPA 2023 statutory retention pruning (Audit Item 21)
      ctx.waitUntil(
        env.DB.prepare(
          "DELETE FROM enquiry WHERE created_at < datetime('now', '-90 days')"
        )
          .run()
          .catch(() => undefined)
      );
    }
  },
};
