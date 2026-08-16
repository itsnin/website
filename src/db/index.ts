import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// use env var or fall back to local file relative to project root
const dbUrl = process.env.DATABASE_URL ?? "file:./db/ninx.db";
const client = createClient({ url: dbUrl });

export const db = drizzle(client, { schema });
