// ============================================================================
// latest-threads.tsx — "Latest from the forum" section on the home page.
// ----------------------------------------------------------------------------
// Server Component. Fetches the 3 most recent forum threads and renders them
// as a compact list. Only renders if there are threads.
//
// Design: a vertical list of 3 compact thread rows, each with an avatar,
// title, category, reply count, and relative time. Gives the home page a
// sense of community activity.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { MessageSquare, Reply, ArrowRight } from "lucide-react";
import { apiFetch, type PaginatedThreads } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/relative-time";

// getInitials — extracts up to 2 uppercase initials from a name for the avatar.
function getInitials(name: string | null): string {
  if (!name) return "N";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export async function LatestThreads() {
  // Fetch the 3 most recent threads (default sort is newest).
  const res = await apiFetch<PaginatedThreads>("/api/forum/threads?page=1&pageSize=3");
  const threads = res.ok ? res.data.items : [];

  // Don't render the section if there are no threads.
  if (threads.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Section header — with a "View all" link to the forum */}
      <div className="flex items-end justify-between border-b hairline pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <MessageSquare className="h-5 w-5 text-accent" />
            Latest from the forum
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent community discussions.
          </p>
        </div>
        <Link
          href="/forum"
          className="hidden items-center gap-1 text-sm font-medium text-accent transition-opacity hover:opacity-80 sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Thread list — vertical, compact rows */}
      <ul className="mt-6 space-y-3">
        {threads.map((t) => (
          <li key={t.id}>
            <Link
              href={`/forum/${t.id}`}
              className="group flex items-start gap-3 rounded-xl border hairline bg-card p-4 shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm"
            >
              {/* Author avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {getInitials(t.author.name)}
              </div>

              {/* Middle: title + meta */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-foreground transition-colors group-hover:text-accent">
                  {t.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                    {t.category}
                  </span>
                  <span aria-hidden className="text-border">·</span>
                  <span>{formatRelativeTime(t.createdAt)}</span>
                </div>
              </div>

              {/* Right: reply count */}
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Reply className="h-3.5 w-3.5" />
                {t._count.replies}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
