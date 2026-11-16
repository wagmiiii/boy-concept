import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";

type Bindings = {
  ASSETS: Fetcher;
  DB?: D1Database;
  ALLOWED_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
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
      const isLocal = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
      if (!isLocal) {
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
  remoteIp?: string
): Promise<boolean> {
  if (!secretKey) {
    // In local dev without secret key configured, bypass verification
    return true;
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

const spikeBody = z.object({
  name: z.string().min(1).max(200),
});

app.get("/api/ping", (c) =>
  c.json({ ok: true, from: "hono", servedAt: new Date().toISOString() })
);

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

export default app;
