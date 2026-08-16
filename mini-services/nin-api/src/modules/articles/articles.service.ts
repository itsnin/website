import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import type { CreateArticleDto, UpdateArticleDto, PaginationDto } from "@/common/dto";

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50); // cap at 50

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { id: true, name: true } } },
      }),
      this.prisma.article.count({ where: { published: true } }),
    ]);

    return { items, total, page, pageSize };
  }

  async listPopular(limit = 3) {
    return this.prisma.article.findMany({
      where: { published: true, views: { gt: 0 } },
      orderBy: { views: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tags: true,
        readingMins: true,
        views: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });
  }

  // small dataset; a proper tag table would be better at scale
  async listByTag(tag: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50);

    const searchNeedle = `,${tag},`;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: {
          published: true,
          OR: [
            { tags: { contains: `,${tag},` } },
            { tags: { contains: `${tag},` } }, // starts with tag
            { tags: { contains: `,${tag}` } }, // ends with tag
            { tags: tag }, // exact match (single tag)
          ],
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { id: true, name: true } } },
      }),
      this.prisma.article.count({
        where: {
          published: true,
          OR: [
            { tags: { contains: `,${tag},` } },
            { tags: { contains: `${tag},` } },
            { tags: { contains: `,${tag}` } },
            { tags: tag },
          ],
        },
      }),
    ]);

    void searchNeedle;

    return { items, total, page, pageSize };
  }

  async listTags(): Promise<Array<{ tag: string; count: number }>> {
    const articles = await this.prisma.article.findMany({
      where: { published: true },
      select: { tags: true },
    });

    const counts = new Map<string, number>();
    for (const a of articles) {
      const tags = a.tags.split(",").map((t) => t.trim()).filter(Boolean);
      for (const t of tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  async getBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!article || !article.published) {
      throw new NotFoundException("Article not found");
    }

    this.prisma.article
      .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
      .catch(() => {
      });

    return article;
  }

  async getNeighbors(slug: string): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
    const source = await this.prisma.article.findUnique({
      where: { slug },
      select: { createdAt: true },
    });
    if (!source) return { prev: null, next: null };

    const [prev, next] = await Promise.all([
      this.prisma.article.findFirst({
        where: { published: true, createdAt: { lt: source.createdAt } },
        orderBy: { createdAt: "desc" },
        select: { slug: true, title: true },
      }),
      this.prisma.article.findFirst({
        where: { published: true, createdAt: { gt: source.createdAt } },
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true },
      }),
    ]);

    return { prev, next };
  }

  async create(authorId: string, dto: CreateArticleDto) {
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

    return this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt ?? "",
        body: dto.body ?? "",
        coverImage: dto.coverImage,
        tags: dto.tags ?? "",
        published: dto.published ?? false,
        featured: dto.featured ?? false,
        readingMins,
        author: { connect: { id: authorId } },
      },
    });
  }

  async update(id: string, dto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }

  async listRelated(slug: string, limit = 3) {
    const source = await this.prisma.article.findUnique({
      where: { slug },
      select: { tags: true, id: true },
    });
    if (!source) return [];

    const tags = source.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const where =
      tags.length > 0
        ? {
            published: true,
            id: { not: source.id },
            OR: tags.map((t) => ({ tags: { contains: t } })),
          }
        : { published: true, id: { not: source.id } };

    const related = await this.prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tags: true,
        readingMins: true,
        createdAt: true,
      },
    });

    return related;
  }
}
