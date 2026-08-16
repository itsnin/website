import { db } from "@/db";
import { forumThreads } from "@/db/schema";
import { sql } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET() {
  // group by category and count threads per category
  const rows = await db
    .select({
      category: forumThreads.category,
      count: sql<number>`count(*)`,
    })
    .from(forumThreads)
    .groupBy(forumThreads.category)
    .orderBy(forumThreads.category);

  return jsonResponse(rows.map((r) => ({ category: r.category, count: Number(r.count) })));
}
