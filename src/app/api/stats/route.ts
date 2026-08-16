// ============================================================================
// app/api/stats/route.ts — GET aggregate site statistics.
// ==========================================================================
import { db } from "@/db";
import { articles, forumThreads, forumReplies } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

// GET /api/stats — returns articles/threads/replies/repos/totalStars/totalViews.
export async function GET() {
  // Run all counts in parallel for minimum latency.
  const [articleCount, threadCount, replyCount, viewSum, repoData] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.published, true)),
    db.select({ count: sql<number>`count(*)` }).from(forumThreads),
    db.select({ count: sql<number>`count(*)` }).from(forumReplies),
    // Sum of views across published articles.
    db.select({ sum: sql<number>`coalesce(sum(${articles.views}), 0)` }).from(articles).where(eq(articles.published, true)),
    // GitHub repos — fetched from the GitHub API. We call our own route handler
    // logic by importing fetch (simpler than refactoring the github route).
    fetchGitHubRepos(),
  ]);

  const repoList = Array.isArray(repoData) ? repoData : [];
  const totalStars = repoList.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);

  return jsonResponse({
    articles: Number(articleCount[0]?.count ?? 0),
    threads: Number(threadCount[0]?.count ?? 0),
    replies: Number(replyCount[0]?.count ?? 0),
    repos: repoList.length,
    totalStars,
    totalViews: Number(viewSum[0]?.sum ?? 0),
  });
}

// fetchGitHubRepos — helper that mirrors the /api/github/repos logic.
// In a production app, we'd refactor this into a shared service.
async function fetchGitHubRepos(): Promise<Array<{ stargazers_count: number }>> {
  const username = process.env.GITHUB_USERNAME;
  if (!username) return [];

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nin-x-server",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers, cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ stargazers_count: number }>;
    return data;
  } catch {
    return [];
  }
}
