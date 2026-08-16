// unauthenticated requests are rate-limited to 60/hour per ip
import { jsonResponse } from "@/lib/api-helpers";

interface RepoShape {
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

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  if (!username) {
    return jsonResponse([]);
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nin-x-server",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return jsonResponse([]);

  const data = (await res.json()) as Array<Record<string, unknown>>;
  const repos: RepoShape[] = data
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

  return jsonResponse(repos);
}
