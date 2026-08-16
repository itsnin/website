import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const q = query.trim();
    if (q.length < 2) return { articles: [], threads: [] };

    const [articles, threads] = await Promise.all([
      this.prisma.article.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { body: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, slug: true, title: true, excerpt: true, createdAt: true },
      }),
      this.prisma.forumThread.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { body: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, category: true, createdAt: true },
      }),
    ]);

    return { articles, threads };
  }
}
