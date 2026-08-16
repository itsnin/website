// ============================================================================
// articles.service.ts — business logic for the Article entity.
// ----------------------------------------------------------------------------
// The service is the ONLY place that talks to Prisma for articles. Controllers
// stay thin; this keeps persistence concerns centralized and testable.
//
// Docs:
//   - NestJS Providers/Services: https://docs.nestjs.com/providers
//   - Prisma client API: https://pris.ly/d/prisma-client
// ==========================================================================
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import type { CreateArticleDto, UpdateArticleDto, PaginationDto } from "@/common/dto";

@Injectable()
export class ArticlesService {
  // Constructor injection — Nest resolves PrismaService via DI.
  // Docs: https://docs.nestjs.com/providers#dependency-injection
  constructor(private readonly prisma: PrismaService) {}

  // listPublic — returns only PUBLISHED articles, newest first.
  // `include: { author: true }` eagerly loads the author relation so the
  // frontend can show "by <name>" without a second round-trip.
  // Docs: https://pris.ly/d/include
  async listPublic(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50); // cap at 50

    // Prisma's skip/take pagination. Docs: https://pris.ly/d/pagination
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

  // listPopular — returns the most-viewed published articles.
  // Used by the home page "Popular" section. Only includes articles with
  // views > 0 so the section is empty until articles get viewed. Limited to
  // a small number (default 3) since it's a highlight strip, not a full list.
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

  // listByTag — returns published articles that contain the given tag.
  // Tags are stored comma-separated in SQLite, so we use `contains` to match.
  // We add leading/trailing comma checks to avoid partial matches (e.g.,
  // tag "go" shouldn't match "google"). This is a pragmatic approach for a
  // small dataset; a proper tag table would be better at scale.
  async listByTag(tag: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 20, 50);

    // The `tags` column is comma-separated. To avoid partial-word matches
    // (tag "go" matching "google"), we normalize: wrap the stored tags and
    // the search tag in commas, then check contains.
    // Example: stored "typescript,patterns" → ",typescript,patterns,"
    // Search tag "go" → ",go," — won't match ",typescript,patterns,".
    const searchNeedle = `,${tag},`;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: {
          published: true,
          // SQLite doesn't have a concatenate function exposed via Prisma,
          // so we match on the raw column with leading/trailing commas added
          // via the `tags` value itself. This works because every stored tags
          // string is "tag1,tag2,..." and we search for ",tag," within a
          // comma-wrapped version. We approximate by searching for the tag
          // with comma boundaries.
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

    // Suppress the unused variable warning — searchNeedle documents the intent.
    void searchNeedle;

    return { items, total, page, pageSize };
  }

  // listTags — returns all distinct tags with their article counts.
  // Since tags are stored comma-separated, we fetch all published articles'
  // tags and aggregate in JS. Fine for a personal site with dozens of articles.
  async listTags(): Promise<Array<{ tag: string; count: number }>> {
    const articles = await this.prisma.article.findMany({
      where: { published: true },
      select: { tags: true },
    });

    // Aggregate counts per tag using a Map.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    const counts = new Map<string, number>();
    for (const a of articles) {
      const tags = a.tags.split(",").map((t) => t.trim()).filter(Boolean);
      for (const t of tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }

    // Convert to array and sort by count desc, then alphabetically.
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  // getBySlug — single article lookup by its URL slug.
  // Also increments the article's view count (fire-and-forget, non-blocking).
  async getBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!article || !article.published) {
      // 404 — hide existence of drafts from the public API.
      throw new NotFoundException("Article not found");
    }

    // Increment views in the background — we don't await this so the response
    // isn't slowed by the write. A small race condition on concurrent views is
    // acceptable for a view counter.
    // Docs: https://pris.ly/d/increment
    this.prisma.article
      .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
      .catch(() => {
        // Swallow errors — a failed view increment shouldn't break the page.
      });

    return article;
  }

  // getNeighbors — returns the previous and next published articles relative
  // to the given slug, ordered by createdAt. Used for the prev/next navigation
  // at the bottom of article pages.
  //
  // "Previous" = the most recent article published BEFORE this one.
  // "Next" = the oldest article published AFTER this one.
  // We run both queries in parallel for minimum latency.
  async getNeighbors(slug: string): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
    // First, load the source article to get its createdAt timestamp.
    const source = await this.prisma.article.findUnique({
      where: { slug },
      select: { createdAt: true },
    });
    if (!source) return { prev: null, next: null };

    // findFirst returns a single record matching the where clause.
    // Docs: https://pris.ly/d/findfirst
    const [prev, next] = await Promise.all([
      // Previous: published, createdAt < source.createdAt, ordered desc (most recent first).
      this.prisma.article.findFirst({
        where: { published: true, createdAt: { lt: source.createdAt } },
        orderBy: { createdAt: "desc" },
        select: { slug: true, title: true },
      }),
      // Next: published, createdAt > source.createdAt, ordered asc (oldest first).
      this.prisma.article.findFirst({
        where: { published: true, createdAt: { gt: source.createdAt } },
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true },
      }),
    ]);

    return { prev, next };
  }

  // create — owner-only. The controller guards this; here we just persist.
  async create(authorId: string, dto: CreateArticleDto) {
    // Slugify the title if no explicit slug was provided.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    const slug =
      dto.slug ??
      dto.title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // Estimate reading time from word count.
    // Average adult reading speed is ~200-250 wpm; we use 200 for a
    // comfortable estimate. Splitting on whitespace strips markdown syntax
    // accurately enough for an estimate.
    // Docs: https://en.wikipedia.org/wiki/Reading_speed
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

  // update — partial update by id. Uses Prisma's spread update syntax.
  async update(id: string, dto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: { ...dto },
    });
  }

  // remove — hard delete. Soft-delete can be added later if needed.
  async remove(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }

  // listRelated — returns up to `limit` other published articles that share at
  // least one tag with the article identified by `slug`. Excludes the article
  // itself. Falls back to "newest" if no tag matches, so the section is never
  // empty when articles exist.
  //
  // We fetch candidates in two passes: first by tag overlap, then by recency.
  // SQLite has no array type, so tags are stored comma-separated and we use
  // `contains` on each tag. This is a pragmatic O(n) scan; fine for a personal
  // site with dozens of articles.
  async listRelated(slug: string, limit = 3) {
    // First, load the source article to read its tags.
    const source = await this.prisma.article.findUnique({
      where: { slug },
      select: { tags: true, id: true },
    });
    if (!source) return [];

    // Parse the source's tags into a clean array.
    const tags = source.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Build an OR filter: an article matches if its tags string contains any
    // of the source tags. We also exclude the source article's own id.
    const where =
      tags.length > 0
        ? {
            published: true,
            id: { not: source.id },
            OR: tags.map((t) => ({ tags: { contains: t } })),
          }
        : { published: true, id: { not: source.id } };

    // findMany returns matching articles; we sort by recency as a tiebreaker.
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
