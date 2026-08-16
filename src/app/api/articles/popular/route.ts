import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, gt, desc } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

// get /api/articles/popular — top 3 by views (only views > 0)
export async function GET() {
  const items = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      tags: articles.tags,
      readingMins: articles.readingMins,
      views: articles.views,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.published, true), gt(articles.views, 0))
    .orderBy(desc(articles.views))
    .limit(3);

  return jsonResponse(
    items.map((a) => ({ ...a, author: { name: a.authorName } })),
  );
}
