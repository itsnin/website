import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";
import { GithubService } from "@/modules/github/github.service";

export interface SiteStats {
  articles: number;
  threads: number;
  replies: number;
  repos: number;
  totalStars: number;
  totalViews: number;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly github: GithubService,
  ) {}

  async getStats(): Promise<SiteStats> {
    const [articles, threads, replies, repoData, viewAgg] = await Promise.all([
      this.prisma.article.count({ where: { published: true } }),
      this.prisma.forumThread.count(),
      this.prisma.forumReply.count(),
      this.github.getRepos().catch(() => []),
      this.prisma.article.aggregate({ _sum: { views: true }, where: { published: true } }),
    ]);

    const repoList = Array.isArray(repoData) ? repoData : [];
    const totalStars = repoList.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
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
