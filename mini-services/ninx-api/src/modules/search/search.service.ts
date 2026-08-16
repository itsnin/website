// ============================================================================
// search.service.ts — cross-entity search.
// ----------------------------------------------------------------------------
// Searches published articles + forum threads by a query string. We use
// Prisma's `contains` with `mode: insensitive` for a simple substring match.
// A full-text search engine (e.g., Meilisearch) can replace this later.
//
// Docs: https://pris.ly/d/filter-conditions-and-operators
// ==========================================================================
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  // search — returns matching articles + threads for a given query.
  async search(query: string) {
    // Trim + reject empty queries early to avoid full-table scans.
    const q = query.trim();
    if (q.length < 2) return { articles: [], threads: [] };

    // Run both queries in parallel via Promise.all for lower latency.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    //
    // NOTE: SQLite is case-insensitive for ASCII by default, so we omit
    // Prisma's `mode: "insensitive"` (which is only supported on Postgres/MySQL).
    // Docs: https://pris.ly/d/query-operators
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
