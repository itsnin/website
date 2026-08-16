import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";
import { paginationSchema } from "@/lib/validations";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const query = paginationSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return jsonResponse({ items: [], total: 0, page: 1, pageSize: 20 });

  const { page, pageSize } = query.data;
  const limit = Math.min(pageSize, 50);
  const offset = (page - 1) * limit;

  const items = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      tags: articles.tags,
      readingMins: articles.readingMins,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      // we check 4 patterns to avoid partial-word matches
      // we use the `or` helper imported above
      like(articles.tags, `%,${decodedTag},%`),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  const extra = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      tags: articles.tags,
      readingMins: articles.readingMins,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      like(articles.tags, `${decodedTag},%`),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);

  const seen = new Set<string>();
  const all = [...items, ...extra].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const exact = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      tags: articles.tags,
      readingMins: articles.readingMins,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      like(articles.tags, `%,${decodedTag}`),
    );

  for (const a of exact) {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      all.push(a);
    }
  }

  const singleTag = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      tags: articles.tags,
      readingMins: articles.readingMins,
      published: articles.published,
      featured: articles.featured,
      views: articles.views,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.tags, decodedTag));

  for (const a of singleTag) {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      all.push(a);
    }
  }

  all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const paged = all.slice(offset, offset + limit);

  return jsonResponse({
    items: paged.map((a) => ({ ...a, author: { name: a.authorName } })),
    total: all.length,
    page,
    pageSize: limit,
  });
}
