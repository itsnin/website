// ============================================================================
// app/api/forum/threads/route.ts — GET (list) + POST (create) threads.
// ==========================================================================
import { NextRequest } from "next/server";
import { db } from "@/db";
import { forumThreads, forumReplies, users } from "@/db/schema";
import { eq, desc, asc, sql, and, or, like } from "drizzle-orm";
import { forumListQuerySchema, createThreadSchema } from "@/lib/validations";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

// GET /api/forum/threads — public list with pagination + category filter + sort.
export async function GET(request: NextRequest) {
  const query = forumListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!query.success) return errorResponse("Invalid query params", 400);

  const { page, pageSize, category, sort } = query.data;
  const limit = Math.min(pageSize, 50);
  const offset = (page - 1) * limit;

  // Build where clause: optional category filter.
  const where = category ? and(eq(forumThreads.category, category)) : undefined;

  // Build orderBy based on sort. Pinned always first.
  const orderBy =
    sort === "oldest"
      ? [desc(forumThreads.pinned), asc(forumThreads.createdAt)]
      : sort === "views"
        ? [desc(forumThreads.pinned), desc(forumThreads.views)]
        : [desc(forumThreads.pinned), desc(forumThreads.createdAt)];

  // For "replies" sort, we need to fetch all + sort in JS (SQLite can't order
  // by a relation count in a single query via Drizzle's API).
  if (sort === "replies") {
    const allThreads = await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        body: forumThreads.body,
        category: forumThreads.category,
        pinned: forumThreads.pinned,
        locked: forumThreads.locked,
        views: forumThreads.views,
        createdAt: forumThreads.createdAt,
        updatedAt: forumThreads.updatedAt,
        authorName: users.name,
        authorAvatarUrl: users.image,
        replyCount: sql<number>`(SELECT count(*) FROM forum_replies WHERE thread_id = ${forumThreads.id})`,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(where)
      .orderBy(desc(forumThreads.pinned), desc(forumThreads.createdAt));

    // Load the latest reply for each thread (for "last activity" + snippet).
    const threadIds = allThreads.map((t) => t.id);
    let latestReplies: Array<{
      threadId: string;
      body: string;
      createdAt: Date;
      authorName: string | null;
      authorAvatarUrl: string | null;
    }> = [];
    if (threadIds.length > 0) {
      latestReplies = await db
        .select({
          threadId: forumReplies.threadId,
          body: forumReplies.body,
          createdAt: forumReplies.createdAt,
          authorName: users.name,
          authorAvatarUrl: users.image,
        })
        .from(forumReplies)
        .leftJoin(users, eq(forumReplies.authorId, users.id))
        .where(sql`${forumReplies.threadId} IN (${sql.join(threadIds.map((id) => sql`${id}`), sql`, `)})`)
        .orderBy(desc(forumReplies.createdAt));
    }

    // Group latest replies by thread (take the first = most recent per thread).
    const replyMap = new Map<string, typeof latestReplies[number]>();
    for (const r of latestReplies) {
      if (!replyMap.has(r.threadId)) replyMap.set(r.threadId, r);
    }

    // Attach reply count + latest reply to each thread.
    const enriched = allThreads.map((t) => ({
      ...t,
      author: { name: t.authorName, avatarUrl: t.authorAvatarUrl },
      _count: { replies: Number(t.replyCount) },
      replies: replyMap.has(t.id)
        ? [{
            createdAt: replyMap.get(t.id)!.createdAt,
            body: replyMap.get(t.id)!.body,
            author: { name: replyMap.get(t.id)!.authorName, avatarUrl: replyMap.get(t.id)!.authorAvatarUrl },
          }]
        : [],
    }));

    // Sort: pinned first, then by reply count desc, then createdAt desc.
    enriched.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const diff = b._count.replies - a._count.replies;
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const total = enriched.length;
    const items = enriched.slice(offset, offset + limit);
    return jsonResponse({ items, total, page, pageSize: limit });
  }

  // Non-"replies" sorts — use Drizzle's orderBy directly.
  const items = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      body: forumThreads.body,
      category: forumThreads.category,
      pinned: forumThreads.pinned,
      locked: forumThreads.locked,
      views: forumThreads.views,
      createdAt: forumThreads.createdAt,
      updatedAt: forumThreads.updatedAt,
      authorName: users.name,
      authorAvatarUrl: users.image,
      replyCount: sql<number>`(SELECT count(*) FROM forum_replies WHERE thread_id = ${forumThreads.id})`,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.authorId, users.id))
    .where(where)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  // Load latest replies for these threads.
  const threadIds = items.map((t) => t.id);
  let latestReplies: Array<{
    threadId: string;
    body: string;
    createdAt: Date;
    authorName: string | null;
    authorAvatarUrl: string | null;
  }> = [];
  if (threadIds.length > 0) {
    latestReplies = await db
      .select({
        threadId: forumReplies.threadId,
        body: forumReplies.body,
        createdAt: forumReplies.createdAt,
        authorName: users.name,
        authorAvatarUrl: users.image,
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(sql`${forumReplies.threadId} IN (${sql.join(threadIds.map((id) => sql`${id}`), sql`, `)})`)
      .orderBy(desc(forumReplies.createdAt));
  }

  const replyMap = new Map<string, typeof latestReplies[number]>();
  for (const r of latestReplies) {
    if (!replyMap.has(r.threadId)) replyMap.set(r.threadId, r);
  }

  const enrichedItems = items.map((t) => ({
    ...t,
    author: { name: t.authorName, avatarUrl: t.authorAvatarUrl },
    _count: { replies: Number(t.replyCount) },
    replies: replyMap.has(t.id)
      ? [{
          createdAt: replyMap.get(t.id)!.createdAt,
          body: replyMap.get(t.id)!.body,
          author: { name: replyMap.get(t.id)!.authorName, avatarUrl: replyMap.get(t.id)!.authorAvatarUrl },
        }]
      : [],
  }));

  // Count total for pagination.
  const totalRows = where
    ? await db.select({ count: sql<number>`count(*)` }).from(forumThreads).where(where)
    : await db.select({ count: sql<number>`count(*)` }).from(forumThreads);
  const total = totalRows[0]?.count ?? 0;

  return jsonResponse({ items: enrichedItems, total, page, pageSize: limit });
}

// POST /api/forum/threads — create a new thread (auth required).
export async function POST(request: NextRequest) {
  const user = await requireAuth().catch((r) => r);
  if (user instanceof Response) return user;

  const body = await request.json().catch(() => null);
  const parsed = createThreadSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues.map((i) => i.message).join(", "), 422);
  }
  const dto = parsed.data;

  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const [created] = await db
    .insert(forumThreads)
    .values({
      id,
      title: dto.title,
      body: dto.body ?? "",
      category: dto.category ?? "general",
      authorId: user.id,
    })
    .returning();

  return jsonResponse(
    { ...created, author: { name: user.name }, _count: { replies: 0 }, replies: [] },
    201,
  );
}
