// Typed environment configuration for the Cloudflare Worker (Task B-2).
import { z } from "zod";

export const envSchema = z.object({
  ALLOWED_ORIGIN: z.string().url().default("https://boyconcept.com"),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ENVIRONMENT: z.enum(["development", "staging", "production"]).default("production"),
});

export type WorkerEnv = z.infer<typeof envSchema> & {
  DB?: D1Database;
};

export function parseEnv(raw: Record<string, unknown>): WorkerEnv {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    // In production, fallback gracefully with safe defaults rather than crashing
    return {
      ALLOWED_ORIGIN: "https://boyconcept.com",
      ENVIRONMENT: "production",
      DB: raw.DB as D1Database | undefined,
    };
  }
  return {
    ...parsed.data,
    DB: raw.DB as D1Database | undefined,
  };
}
