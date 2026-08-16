import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, forumThreads } from "@/db/schema";
import { eq, or, like, desc } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const query = q.trim();
  if (query.length < 2) return jsonResponse({ articles: [], threads: [] });

  const articleResults = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(
      eq(articles.published, true),
      or(
        like(articles.title, `%${query}%`),
        like(articles.excerpt, `%${query}%`),
        like(articles.body, `%${query}%`),
        like(articles.tags, `%${query}%`),
      ),
    )
    .orderBy(desc(articles.createdAt))
    .limit(10);

  const threadResults = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      category: forumThreads.category,
      createdAt: forumThreads.createdAt,
    })
    .from(forumThreads)
    .where(
      or(
        like(forumThreads.title, `%${query}%`),
        like(forumThreads.body, `%${query}%`),
      ),
    )
    .orderBy(desc(forumThreads.createdAt))
    .limit(10);

  return jsonResponse({ articles: articleResults, threads: threadResults });
}
