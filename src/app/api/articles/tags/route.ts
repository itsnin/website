import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET() {
  const rows = await db
    .select({ tags: articles.tags })
    .from(articles)
    .where(eq(articles.published, true));

  // aggregate counts per tag in js (tags are comma-separated)
  const counts = new Map<string, number>();
  for (const r of rows) {
    const tags = r.tags.split(",").map((t) => t.trim()).filter(Boolean);
    for (const t of tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }

  const result = Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return jsonResponse(result);
}
