// post: owner-only create (requires auth)
import { NextRequest } from "next/server";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { paginationSchema, createArticleSchema } from "@/lib/validations";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const query = paginationSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return errorResponse("Invalid pagination params", 400);

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
      authorId: users.id,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  const enrichedItems = items.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    tags: a.tags,
    readingMins: a.readingMins,
    published: a.published,
    featured: a.featured,
    views: a.views,
    createdAt: a.createdAt,
    author: { id: a.authorId, name: a.authorName },
  }));

  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.published, true));
  const total = totalRows[0]?.count ?? 0;

  return jsonResponse({ items: enrichedItems, total, page, pageSize: limit });
}

// post /api/articles — owner-only create
export async function POST(request: NextRequest) {
  const user = await requireAuth().catch((r) => r);
  if (user instanceof Response) return user;

  const body = await request.json().catch(() => null);
  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues.map((i) => i.message).join(", "), 422);
  }
  const dto = parsed.data;

  // slugify the title if no explicit slug was provided
  const slug =
    dto.slug ??
    dto.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const wordCount = (dto.body ?? "").split(/\s+/).filter(Boolean).length;
  const readingMins = Math.max(1, Math.round(wordCount / 200));

  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const [created] = await db
    .insert(articles)
    .values({
      id,
      title: dto.title,
      slug,
      excerpt: dto.excerpt ?? "",
      body: dto.body ?? "",
      coverImage: dto.coverImage || null,
      tags: dto.tags ?? "",
      published: dto.published ?? false,
      featured: dto.featured ?? false,
      readingMins,
      authorId: user.id,
    })
    .returning();

  return jsonResponse(created, 201);
}
