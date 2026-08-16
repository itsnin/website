import { NextRequest } from "next/server";
import { db } from "@/db";
import { forumThreads, forumReplies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createReplySchema } from "@/lib/validations";
import { jsonResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAuth().catch((r) => r);
  if (user instanceof Response) return user;

  const { id: threadId } = await params;

  const threadRows = await db
    .select({ id: forumThreads.id, locked: forumThreads.locked })
    .from(forumThreads)
    .where(eq(forumThreads.id, threadId))
    .limit(1);
  const thread = threadRows[0];
  if (!thread) return errorResponse("Thread not found", 404);
  if (thread.locked) return errorResponse("Thread is locked", 403);

  const body = await request.json().catch(() => null);
  const parsed = createReplySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues.map((i) => i.message).join(", "), 422);
  }

  const replyId = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const [created] = await db
    .insert(forumReplies)
    .values({
      id: replyId,
      body: parsed.data.body,
      threadId,
      authorId: user.id,
    })
    .returning();

  return jsonResponse(
    { ...created, author: { name: user.name } },
    201,
  );
}
