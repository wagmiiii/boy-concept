import { Hono } from "hono";
import { z } from "zod";

type Bindings = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

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
app.all("*", (c) =>
  c.json(
    { error: { code: "NOT_HANDLED", path: new URL(c.req.url).pathname } },
    404
  )
);

export default app;
