// ============================================================================
// app/api/forum/threads/[id]/route.ts — GET single thread + paginated replies.
// ----------------------------------------------------------------------------
// Also increments the thread's view count (fire-and-forget).
// ==========================================================================
import { NextRequest } from "next/server";
import { db } from "@/db";
import { forumThreads, forumReplies, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { paginationSchema } from "@/lib/validations";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

// GET /api/forum/threads/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const query = paginationSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!query.success) return errorResponse("Invalid pagination", 400);
  const { page, pageSize } = query.data;
  const limit = Math.min(pageSize, 100);
  const offset = (page - 1) * limit;

  // Fetch the thread + author.
  const threadRows = await db
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
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.authorId, users.id))
    .where(eq(forumThreads.id, id))
    .limit(1);

  const thread = threadRows[0];
  if (!thread) return errorResponse("Thread not found", 404);

  // Increment views (fire-and-forget).
  db.update(forumThreads)
    .set({ views: sql`${forumThreads.views} + 1` })
    .where(eq(forumThreads.id, id))
    .then(() => {})
    .catch(() => {});

  // Fetch paginated replies (oldest first for forum reading order).
  const replies = await db
    .select({
      id: forumReplies.id,
      body: forumReplies.body,
      createdAt: forumReplies.createdAt,
      authorName: users.name,
      authorAvatarUrl: users.image,
    })
    .from(forumReplies)
    .leftJoin(users, eq(forumReplies.authorId, users.id))
    .where(eq(forumReplies.threadId, id))
    .orderBy(forumReplies.createdAt)
    .limit(limit)
    .offset(offset);

  // Count total replies.
  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(forumReplies)
    .where(eq(forumReplies.threadId, id));
  const replyTotal = totalRows[0]?.count ?? 0;

  return jsonResponse({
    thread: {
      ...thread,
      author: { name: thread.authorName, avatarUrl: thread.authorAvatarUrl },
    },
    replies: replies.map((r) => ({
      ...r,
      author: { name: r.authorName, avatarUrl: r.authorAvatarUrl },
    })),
    replyTotal,
    page,
    pageSize: limit,
  });
}
