// ============================================================================
// drizzle.config.ts — configuration for drizzle-kit (migrations + push).
// ----------------------------------------------------------------------------
// Points drizzle-kit at our schema + the local SQLite database file.
// Uses the libSQL driver (pure JS, works everywhere).
// In production (Cloudflare D1), migrations are applied via
// `wrangler d1 migrations apply` — this config is only for local development.
//
// Docs: https://orm.drizzle.team/docs/drizzle-config
// ==========================================================================
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:/home/z/my-project/db/ninx.db",
  },
} satisfies Config;
