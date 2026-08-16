// ============================================================================
// db/index.ts — Drizzle ORM database client.
// ----------------------------------------------------------------------------
// This file creates the Drizzle client using the @libsql/client driver, which
// is a pure-JavaScript SQLite client that works under Node.js, Bun, AND
// Cloudflare Workers. This makes it the ideal driver for local development
// that's also production-ready for Cloudflare.
//
// For Cloudflare D1 production, swap to the D1 driver (one-line change):
//
//   // Production (Cloudflare D1):
//   import { drizzle } from "drizzle-orm/d1";
//   const db = drizzle(env.DB, { schema });
//
// Docs:
//   - Drizzle libSQL: https://orm.drizzle.team/docs/get-started/libsql
//   - Drizzle D1: https://orm.drizzle.team/docs/get-started/d1
//   - libSQL client: https://github.com/libsql/libsql-client-ts
// ==========================================================================
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Create the libSQL client pointing at a local SQLite file.
// libSQL is a fork of SQLite that supports both local files + remote URLs.
// For local dev, we use a file:// URL.
const client = createClient({ url: "file:/home/z/my-project/db/ninx.db" });

// Create the Drizzle instance with the schema so relational queries work.
// Docs: https://orm.drizzle.team/docs/rqb
export const db = drizzle(client, { schema });
