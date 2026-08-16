import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import type { CreateThreadDto, CreateReplyDto, PaginationDto } from "@/common/dto";

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async listThreads(
    pagination?: PaginationDto,
    category?: string,
    sort: "newest" | "oldest" | "views" | "replies" = "newest",
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50);

    const where = category ? { category } : {};

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
      const allThreads = await this.prisma.forumThread.findMany({
        where,
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { replies: true } },
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
          _count: { select: { replies: true } },
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

  async getThread(id: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 100);

    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, author: { select: { name: true } } },
        },
      },
    });
    if (!thread) throw new NotFoundException("Thread not found");

    this.prisma.forumThread
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {
      });

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

  async listCategories() {
    const groups = await this.prisma.forumThread.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { category: "asc" },
    });
    return groups.map((g) => ({ category: g.category, count: g._count.id }));
  }

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

  async createReply(authorId: string, threadId: string, dto: CreateReplyDto) {
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
