import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL ?? "file:./db/ninx.db";
const client = createClient({ url: dbUrl });

export const db = drizzle(client, { schema });
