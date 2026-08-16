// ============================================================================
// app/api/articles/by-tag/[tag]/route.ts — GET articles for a tag.
// ==========================================================================
import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";
import { paginationSchema } from "@/lib/validations";
import { jsonResponse } from "@/lib/api-helpers";

// GET /api/articles/by-tag/:tag
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

  // Match articles whose tags contain the decoded tag (comma-boundary aware
  // via OR on 4 patterns: middle, start, end, exact).
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
      // SQLite `like` is case-insensitive for ASCII.
      // We check 4 patterns to avoid partial-word matches.
      // Drizzle doesn't have an `or` for arbitrary conditions directly, so
      // we use the `or` helper imported above.
      like(articles.tags, `%,${decodedTag},%`),
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  // Also match start/end/exact patterns in a second query (simpler than OR).
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

  // Deduplicate by id (an article may match both patterns).
  const seen = new Set<string>();
  const all = [...items, ...extra].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  // Also match exact single-tag + end patterns.
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

  // Also match exact (single tag = the decoded tag).
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

  // Sort by createdAt desc, slice for pagination.
  all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const paged = all.slice(offset, offset + limit);

  return jsonResponse({
    items: paged.map((a) => ({ ...a, author: { name: a.authorName } })),
    total: all.length,
    page,
    pageSize: limit,
  });
}
