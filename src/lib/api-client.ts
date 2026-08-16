// relative urls dont resolve on the server so we need an absolute url there
const isServer = typeof window === "undefined";
const SERVER_BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
function buildUrl(path: string): string {
  if (isServer) {
    return `${SERVER_BASE}${path}`;
  }
  return path;
}
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const url = buildUrl(path);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    };
    // no-store ensures fresh data on every call, content site needs this
    const res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.error ?? `Request failed (${res.status})`;
      return { ok: false, error: message, status: res.status };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}
// types duplicated here instead of importing from backend to avoid build-time coupling
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string;
  readingMins: number;
  featured: boolean;
  views: number;
  createdAt: string;
  author: { id: string; name: string | null };
}
export interface ArticleDetail extends ArticleSummary {
  body: string;
  updatedAt: string;
}
export interface PaginatedArticles {
  items: ArticleSummary[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ForumThreadSummary {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null; avatarUrl: string | null };
  _count: { replies: number };
  replies: Array<{
    createdAt: string;
    body: string;
    author: { id: string; name: string | null; avatarUrl: string | null };
  }>;
}
export interface PaginatedThreads {
  items: ForumThreadSummary[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ForumReply {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; avatarUrl: string | null };
}
export interface ThreadDetail {
  thread: ForumThreadSummary;
  replies: ForumReply[];
  replyTotal: number;
  page: number;
  pageSize: number;
}
export interface CategoryCount {
  category: string;
  count: number;
}
export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string | null;
  status: string;
}
export interface GithubRepo {
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
export interface AuthStatus {
  email: boolean;
  google: boolean;
  apple: boolean;
  ready: boolean;
}
export interface SearchResult {
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    createdAt: string;
  }>;
  threads: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
  }>;
}
export interface SiteStats {
  articles: number;
  threads: number;
  replies: number;
  repos: number;
  totalStars: number;
  totalViews: number;
}
export interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string;
  readingMins: number;
  createdAt: string;
}
export interface TagCount {
  tag: string;
  count: number;
}
export interface ArticleNeighbors {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}
// includes views field because home page shows "n views" on each card
export interface PopularArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string;
  readingMins: number;
  views: number;
  createdAt: string;
  author: { id: string; name: string | null };
}
