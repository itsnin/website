import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, ne, sql } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const sourceRows = await db
    .select({ tags: articles.tags, id: articles.id })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  const source = sourceRows[0];
  if (!source) return jsonResponse([]);

  const tags = source.tags.split(",").map((t) => t.trim()).filter(Boolean);

  let tagCondition = sql`1=1`;
  if (tags.length > 0) {
    const conditions = tags.map((t) => sql`${articles.tags} LIKE ${`%${t}%`}`);
    tagCondition = sql.join(conditions, sql` OR `);
  }

  const related = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      tags: articles.tags,
      readingMins: articles.readingMins,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      sql`${articles.published} = 1 AND ${articles.id} != ${source.id} AND (${tagCondition})`,
    )
    .orderBy(sql`${articles.createdAt} DESC`)
    .limit(3);

  return jsonResponse(
    related.map((r) => ({ ...r, author: { name: r.authorName } })),
  );
}
