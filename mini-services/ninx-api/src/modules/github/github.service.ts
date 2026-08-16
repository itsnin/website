import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly config: ConfigService) {}

  async getRepos(): Promise<RepoShape[]> {
    const username = this.config.get<string>("GITHUB_USERNAME");
    if (!username) {
      this.logger.warn("GITHUB_USERNAME not set; returning empty repo list.");
      return [];
    }

    const token = this.config.get<string>("GITHUB_TOKEN");
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "nin-x-server",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      this.logger.error(`GitHub API responded ${res.status}`);
      return [];
    }

    const data = (await res.json()) as Array<Record<string, unknown>>;
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
