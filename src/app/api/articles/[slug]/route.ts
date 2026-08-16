// also increments the view count (fire-and-forget, non-blocking)
import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      body: articles.body,
      coverImage: articles.coverImage,
      tags: articles.tags,
      readingMins: articles.readingMins,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorId: articles.authorId,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  const article = rows[0];
  if (!article || !article.published) {
    return errorResponse("Article not found", 404);
  }

  // so the response isn't slowed by the write
  db.update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, article.id))
    .then(() => {})
    .catch(() => {});

  return jsonResponse({
    ...article,
    author: { id: article.authorId, name: article.authorName },
  });
}
