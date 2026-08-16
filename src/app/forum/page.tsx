// searchparams keeps filter state in the url so its shareable
import Link from "next/link";
import { MessageSquare, Pin, Lock, Reply, Plus, Filter, Eye, Clock } from "lucide-react";
import { apiFetch, type PaginatedThreads, type CategoryCount } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getInitials(name: string | null): string {
  if (!name) return "N";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default async function ForumPage({
  // in next.js 16, searchparams is a promise that must be awaited
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const activeCategory = category && category.trim().length > 0 ? category.trim() : undefined;

  const validSorts = ["newest", "oldest", "views", "replies"];
  const activeSort = sort && validSorts.includes(sort) ? sort : "newest";

  const params = new URLSearchParams({ page: "1", pageSize: "20", sort: activeSort });
  if (activeCategory) params.set("category", activeCategory);
  const threadsUrl = `/api/forum/threads?${params.toString()}`;

  const [threadsRes, catsRes] = await Promise.all([
    apiFetch<PaginatedThreads>(threadsUrl),
    apiFetch<CategoryCount[]>("/api/forum/categories"),
  ]);

  const threads = threadsRes.ok ? threadsRes.data.items : [];
  const categories = catsRes.ok ? catsRes.data : [];
  const hasThreads = threads.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 border-b hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Forum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open discussion. Anyone can read; signed-in users can post.
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New thread
          </Link>
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3 w-3" />
            Filter
          </span>
          <Link
            href={`/forum${activeSort !== "newest" ? `?sort=${activeSort}` : ""}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all hover:-translate-y-0.5 ${
              !activeCategory
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/forum?category=${encodeURIComponent(c.category)}${activeSort !== "newest" ? `&sort=${activeSort}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                activeCategory === c.category
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.category} · {c.count}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Sort
        </span>
        {(["newest", "oldest", "views", "replies"] as const).map((s) => {
          const params = new URLSearchParams();
          if (activeCategory) params.set("category", activeCategory);
          if (s !== "newest") params.set("sort", s);
          const href = `/forum${params.toString() ? `?${params.toString()}` : ""}`;
          const labels: Record<typeof s, string> = {
            newest: "Newest",
            oldest: "Oldest",
            views: "Most viewed",
            replies: "Most replies",
          };
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                activeSort === s
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[s]}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        {hasThreads ? (
          <ul className="divide-y hairline overflow-hidden rounded-2xl border hairline bg-card shadow-premium-xs">
            {threads.map((t) => {
              const lastReply = t.replies && t.replies.length > 0 ? t.replies[0] : null;
              const hasReplies = t._count.replies > 0;
              return (
                <li key={t.id}>
                  <Link
                    href={`/forum/${t.id}`}
                    className={`group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-secondary ${
                      hasReplies ? "border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {getInitials(t.author.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {(t.pinned || t.locked) && (
                        <div className="mb-1 flex gap-1.5">
                          {t.pinned && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-accent">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                          {t.locked && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                      )}
                      <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-accent">
                        {t.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {t.author.name ?? "Anonymous"}
                        </span>
                        <span aria-hidden className="text-border">·</span>
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                          {t.category}
                        </span>
                        <span aria-hidden className="text-border">·</span>
                        {/* "last activity" — the latest reply's createdat if any replies exist, otherwise the thread's createdat */}
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(lastReply ? lastReply.createdAt : t.createdAt)}
                        </span>
                        {hasReplies && (
                          <span className="inline-flex items-center gap-0.5 text-accent">
                            · active
                          </span>
                        )}
                      </div>
                      
                      {lastReply && (
                        <div className="mt-2 flex items-start gap-2 border-l-2 border-accent/60 bg-secondary/40 py-2 pl-3 pr-2">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[9px] font-semibold text-accent">
                            {(lastReply.author.name ?? "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            
                            <p className="truncate text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">
                                {lastReply.author.name ?? "Anonymous"}
                              </span>
                              {": "}
                              {lastReply.body}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Reply className="h-3.5 w-3.5" />
                        {t._count.replies}
                      </span>
                      {"views" in t && typeof t.views === "number" && (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {t.views}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed hairline bg-card px-6 py-16 text-center shadow-premium-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {activeCategory
                ? `No threads in "${activeCategory}"`
                : "No threads yet"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {activeCategory
                ? "There are no threads in this category yet. Try a different category or start a new thread."
                : "The forum is ready and waiting. Once sign-in is live, you'll be able to start the first discussion here."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {activeCategory && (
                <Link
                  href="/forum"
                  className="inline-flex items-center gap-2 rounded-full border hairline bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Show all threads
                </Link>
              )}
              <Button asChild variant="outline">
                <Link href="/auth">Sign in to post</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
