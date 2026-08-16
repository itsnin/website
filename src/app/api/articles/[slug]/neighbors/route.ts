import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // (number) to avoid date serialization issues in the comparison
  const sourceRows = await db
    .select({ createdAt: articles.createdAt })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  const source = sourceRows[0];
  if (!source) return jsonResponse({ prev: null, next: null });

  const sourceTime = Math.floor(source.createdAt.getTime() / 1000);

  const prevRows = await db
    .select({ slug: articles.slug, title: articles.title })
    .from(articles)
    .where(sql`${articles.published} = 1 AND ${articles.createdAt} < ${sourceTime}`)
    .orderBy(sql`${articles.createdAt} DESC`)
    .limit(1);

  const nextRows = await db
    .select({ slug: articles.slug, title: articles.title })
    .from(articles)
    .where(sql`${articles.published} = 1 AND ${articles.createdAt} > ${sourceTime}`)
    .orderBy(sql`${articles.createdAt} ASC`)
    .limit(1);

  return jsonResponse({
    prev: prevRows[0] ?? null,
    next: nextRows[0] ?? null,
  });
}
