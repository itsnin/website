// ============================================================================
// forum.service.ts — forum thread + reply business logic.
// ----------------------------------------------------------------------------
// Read operations are public. Write operations require an authenticated user,
// enforced by AuthGuard on the controller.
//
// Docs: https://docs.nestjs.com/providers
// ==========================================================================
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import type { CreateThreadDto, CreateReplyDto, PaginationDto } from "@/common/dto";

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  // listThreads — public. Pinned threads float to the top, then sorted by
  // the `sort` param (default: newest by createdAt).
  // If `category` is provided, filters to that category only.
  // sort options: "newest" (createdAt desc), "oldest" (createdAt asc),
  //   "views" (views desc), "replies" (reply count desc — requires raw SQL
  //   or post-sort; we use a simpler approach: fetch + sort in JS).
  async listThreads(
    pagination?: PaginationDto,
    category?: string,
    sort: "newest" | "oldest" | "views" | "replies" = "newest",
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50);

    // Build the where clause: optionally filter by category.
    const where = category ? { category } : {};

    // Determine the orderBy based on the sort param.
    // Pinned threads always float to the top regardless of sort.
    // For "replies" sort, we can't order by a relation count directly in
    // Prisma's findMany orderBy (SQLite limitation), so we fetch all matching
    // threads, sort in JS, then paginate. This is fine for a personal site
    // with dozens of threads but wouldn't scale to thousands.
    const buildOrderBy = (): Array<Record<string, "asc" | "desc">> => {
      switch (sort) {
        case "oldest":
          return [{ pinned: "desc" }, { createdAt: "asc" }];
        case "views":
          return [{ pinned: "desc" }, { views: "desc" }];
        case "newest":
        default:
          return [{ pinned: "desc" }, { createdAt: "desc" }];
      }
    };

    if (sort === "replies") {
      // Fetch all matching threads with reply counts + latest reply, sort in JS, paginate.
      const allThreads = await this.prisma.forumThread.findMany({
        where,
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { replies: true } },
          // Load latest reply for "last activity" (same as the non-replies branch).
          replies: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
              body: true,
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      });
      // Sort: pinned first, then by reply count desc, then by createdAt desc.
      allThreads.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const replyDiff = b._count.replies - a._count.replies;
        if (replyDiff !== 0) return replyDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      const total = allThreads.length;
      const items = allThreads.slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumThread.findMany({
        where,
        orderBy: buildOrderBy(),
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          // `_count` gives us reply count without fetching all replies.
          // Docs: https://pris.ly/d/count
          _count: { select: { replies: true } },
          // Load the latest reply (take: 1, ordered desc) so the frontend can
          // show a "last activity" timestamp + the last replier's name + a
          // snippet of their reply. If there are no replies, this is empty.
          replies: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              createdAt: true,
              body: true,
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.forumThread.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // getThread — public. Returns thread + paginated replies.
  // Also increments the thread's view count (fire-and-forget, non-blocking).
  async getThread(id: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 100);

    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        // Load the latest reply for a "last activity" timestamp.
        replies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, author: { select: { name: true } } },
        },
      },
    });
    if (!thread) throw new NotFoundException("Thread not found");

    // Increment views in the background — we don't await this so the response
    // isn't slowed by the write. A small race condition on concurrent views is
    // acceptable for a view counter.
    // Docs: https://pris.ly/d/increment
    this.prisma.forumThread
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {
        // Swallow errors — a failed view increment shouldn't break the page.
      });

    // Fetch replies separately so we can paginate them independently.
    const [replies, replyTotal] = await this.prisma.$transaction([
      this.prisma.forumReply.findMany({
        where: { threadId: id },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      this.prisma.forumReply.count({ where: { threadId: id } }),
    ]);

    return { thread, replies, replyTotal, page, pageSize };
  }

  // listCategories — returns distinct categories with thread counts.
  async listCategories() {
    // groupBy aggregates threads by category. Docs: https://pris.ly/d/group-by
    const groups = await this.prisma.forumThread.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { category: "asc" },
    });
    return groups.map((g) => ({ category: g.category, count: g._count.id }));
  }

  // createThread — requires authenticated user (enforced upstream).
  async createThread(authorId: string, dto: CreateThreadDto) {
    return this.prisma.forumThread.create({
      data: {
        title: dto.title,
        body: dto.body ?? "",
        category: dto.category ?? "general",
        author: { connect: { id: authorId } },
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true } },
      },
    });
  }

  // createReply — requires authenticated user.
  async createReply(authorId: string, threadId: string, dto: CreateReplyDto) {
    // Verify the thread exists + isn't locked before accepting the reply.
    const thread = await this.prisma.forumThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException("Thread not found");
    if (thread.locked) throw new Error("Thread is locked");

    return this.prisma.forumReply.create({
      data: {
        body: dto.body,
        thread: { connect: { id: threadId } },
        author: { connect: { id: authorId } },
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }
}
