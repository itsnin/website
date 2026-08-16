// ============================================================================
// stats.service.ts — aggregate site statistics for the home page banner.
// ----------------------------------------------------------------------------
// Returns counts of published articles, forum threads, replies, and GitHub
// repos. Used by the home page "stats" strip to give the page a sense of life
// even when content is sparse.
//
// Docs: https://pris.ly/d/aggregations
// ==========================================================================
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import { GithubService } from "@/modules/github/github.service";

// SiteStats — the shape returned to the frontend.
export interface SiteStats {
  articles: number;
  threads: number;
  replies: number;
  repos: number;
  // totalStars — sum of stargazers_count across all GitHub repos.
  // 0 when no repos are configured.
  totalStars: number;
  // totalViews — sum of views across all published articles.
  // Gives a sense of overall readership.
  totalViews: number;
}

@Injectable()
export class StatsService {
  // Inject both Prisma (for DB counts) and GithubService (for repo count).
  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GithubService,
  ) {}

  // getStats — runs all counts in parallel via Promise.all for minimum latency.
  async getStats(): Promise<SiteStats> {
    // Prisma `count` returns a single number per call. Running them in parallel
    // avoids sequential round-trips. Docs: https://pris.ly/d/count
    const [articles, threads, replies, repoData, viewAgg] = await Promise.all([
      this.prisma.article.count({ where: { published: true } }),
      this.prisma.forumThread.count(),
      this.prisma.forumReply.count(),
      // GitHub repos come from the API; if the handle isn't configured this
      // resolves to an empty array.
      this.github.getRepos().catch(() => []),
      // Sum all article views. `_sum` aggregation. Docs: https://pris.ly/d/aggregations
      this.prisma.article.aggregate({ _sum: { views: true }, where: { published: true } }),
    ]);

    // totalStars — sum of stargazers_count across all repos.
    // Guard against repoData being undefined/non-array (defensive).
    const repoList = Array.isArray(repoData) ? repoData : [];
    const totalStars = repoList.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
    // totalViews — from the aggregation result (0 if no articles).
    const totalViews = viewAgg._sum.views ?? 0;

    return {
      articles,
      threads,
      replies,
      repos: repoList.length,
      totalStars,
      totalViews,
    };
  }
}
