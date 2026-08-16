// ============================================================================
// api-client.ts — typed HTTP client for the NiN.X API.
// ----------------------------------------------------------------------------
// The API is now served by Next.js Route Handlers (app/api/.../route.ts),
// running in the same process as the frontend. This means all requests are
// same-origin relative URLs — no gateway, no XTransformPort, no CORS.
//
// This architecture is Cloudflare Pages-ready: Route Handlers deploy as
// Workers via @cloudflare/next-on-pages, and the frontend + API share the
// same origin (your-project.pages.dev).
//
// Docs:
//   - Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
//   - fetch API: https://developer.mozilla.org/en-US/docs/Web/API/fetch
// ==========================================================================

// buildUrl — constructs the correct URL for the current runtime:
//   - Server Component: absolute URL (http://localhost:3000/api/...) because
//     relative URLs don't resolve on the server (no origin).
//   - Client Component: relative URL (/api/...) so the browser's request
//     is same-origin.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
const isServer = typeof window === "undefined";
const SERVER_BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function buildUrl(path: string): string {
  if (isServer) {
    // Server-side: use an absolute URL so fetch can resolve it.
    return `${SERVER_BASE}${path}`;
  }
  // Client-side: relative URL (same-origin).
  return path;
}

// ApiResult — discriminated union so callers must handle both success + error.
// This enforces enterprise-grade error handling at the type level.
// Docs: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

// apiFetch — the core request function. Returns an ApiResult so callers
// never get an unhandled throw. Uses generics for end-to-end type safety.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    // Build the correct URL for the current runtime (server vs client).
    const url = buildUrl(path);

    // fetch options. We default Content-Type to JSON for POST/PATCH bodies.
    // Headers are merged so callers can override (e.g., for auth).
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    };

    // Execute the request. `cache: "no-store"` ensures fresh data on every
    // call — important for a content site where articles may update.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
    const res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });

    // Parse the JSON body. Empty 204 responses yield null.
    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      // NestJS validation errors return { message: string | string[] }.
      // Normalize to a single string for the frontend.
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
    // Network errors / JSON parse errors land here.
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}

// ============================================================================
// Typed response shapes — mirror the NestJS DTOs for end-to-end type safety.
// Keeping these in the frontend (not importing from the backend) avoids a
// build-time coupling between the two services.
// ============================================================================

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
  // replies — array of 0 or 1 element: the latest reply with author + body snippet.
  // Used to compute "last activity" timestamp + show a reply snippet in the thread list.
  // Empty when no replies exist.
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

// SiteStats — aggregate counts shown on the home page stats banner.
export interface SiteStats {
  articles: number;
  threads: number;
  replies: number;
  repos: number;
  totalStars: number;
  totalViews: number;
}

// RelatedArticle — slim article shape returned by /api/articles/:slug/related.
export interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string;
  readingMins: number;
  createdAt: string;
}

// TagCount — a tag with its article count, returned by /api/articles/tags.
export interface TagCount {
  tag: string;
  count: number;
}

// CategoryCount — a forum category with its thread count.
export interface CategoryCount {
  category: string;
  count: number;
}

// ArticleNeighbors — prev/next articles for navigation at the bottom of
// article pages. Either field can be null if there's no article in that direction.
export interface ArticleNeighbors {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

// PopularArticle — slim article shape returned by /api/articles/popular.
// Includes views so the home page can show "N views" on each card.
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
