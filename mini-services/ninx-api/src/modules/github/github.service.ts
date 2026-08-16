// ============================================================================
// github.service.ts — fetches the owner's public GitHub repos.
// ----------------------------------------------------------------------------
// Uses GitHub's public REST API. No auth token required for public repos, but
// unauthenticated requests are rate-limited to 60/hour per IP. The owner can
// set GITHUB_TOKEN later to raise this to 5000/hour.
//
// Docs:
//   - GitHub REST API: https://docs.github.com/en/rest/repos/repos
//   - Rate limiting: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
// ==========================================================================
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// RepoShape — the minimal projection we return to the frontend.
export interface RepoShape {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  homepage: string | null;
  topics: string[];
}

@Injectable()
export class GithubService {
  // NestJS Logger — structured, level-aware. Docs: https://docs.nestjs.com/techniques/logger
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly config: ConfigService) {}

  // getRepos — fetch the owner's public repos, sorted by stars desc.
  async getRepos(): Promise<RepoShape[]> {
    const username = this.config.get<string>("GITHUB_USERNAME");
    if (!username) {
      // No username configured — return empty so the frontend shows the
      // "configure your GitHub handle" empty state.
      this.logger.warn("GITHUB_USERNAME not set; returning empty repo list.");
      return [];
    }

    const token = this.config.get<string>("GITHUB_TOKEN");
    // Build request headers. If a token exists, we authenticate for higher
    // rate limits. Docs: https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "nin-x-server",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
    // fetch is available globally in Bun/Node 18+. Docs: https://developer.mozilla.org/en-US/docs/Web/API/fetch
    const res = await fetch(url, { headers });
    if (!res.ok) {
      this.logger.error(`GitHub API responded ${res.status}`);
      return [];
    }

    const data = (await res.json()) as Array<Record<string, unknown>>;
    // Map to our slim shape + sort by stars desc so the best repos surface first.
    return data
      .map((r) => ({
        id: r.id as number,
        name: r.name as string,
        full_name: r.full_name as string,
        html_url: r.html_url as string,
        description: (r.description as string) ?? null,
        language: (r.language as string) ?? null,
        stargazers_count: r.stargazers_count as number,
        forks_count: r.forks_count as number,
        updated_at: r.updated_at as string,
        homepage: (r.homepage as string) ?? null,
        topics: ((r.topics as string[]) ?? []) as string[],
      }))
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  }
}
