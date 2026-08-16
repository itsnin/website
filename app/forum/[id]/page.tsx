// ============================================================================
// forum/[id]/page.tsx — single thread view with replies.
// ----------------------------------------------------------------------------
// Server Component. Fetches the thread + paginated replies. The reply form
// is a client component that gates submission on auth status.
//
// Docs:
//   - Next.js dynamic routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
// ==========================================================================
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin, Lock, Clock, Eye } from "lucide-react";
import { apiFetch, type ThreadDetail } from "@/lib/api-client";
import { ReplyComposer } from "@/components/forum/reply-composer";

// formatDate — full timestamp for thread context.
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ThreadPage — async Server Component receiving the dynamic `id` param.
// In Next.js 16, dynamic route params are a Promise that must be awaited.
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await apiFetch<ThreadDetail>(`/api/forum/threads/${id}`);
  if (!res.ok) {
    // If the thread doesn't exist, render the 404 page.
    notFound();
  }

  const { thread, replies } = res.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Back link to the forum list */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to forum
      </Link>

      {/* ---- Thread header ---- */}
      <div className="mt-6 border-b hairline pb-6">
        {/* Indicators: pinned / locked */}
        {(thread.pinned || thread.locked) && (
          <div className="mb-3 flex gap-2">
            {thread.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            {thread.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {thread.title}
        </h1>

        {/* Meta row — author avatar + name + category + date + views */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {/* Author avatar with initials */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
              {thread.author.name?.charAt(0).toUpperCase() ?? "N"}
            </div>
            <span className="font-medium text-foreground/80">
              {thread.author.name ?? "Anonymous"}
            </span>
          </div>
          <span aria-hidden className="text-border">·</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
            {thread.category}
          </span>
          <span aria-hidden className="text-border">·</span>
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {formatDate(thread.createdAt)}
          </span>
          {/* Views — only show if the field exists (added in schema v2). */}
          {"views" in thread && typeof thread.views === "number" && (
            <>
              <span aria-hidden className="text-border">·</span>
              <span className="inline-flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {thread.views} {thread.views === 1 ? "view" : "views"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ---- Thread body (the "opening post") — with OP visual treatment ---- */}
      {/* The OP gets a distinct visual treatment: larger font, a subtle background
          tint, and a left accent border to separate it from replies below.
          This establishes hierarchy — the OP is the "article", replies are comments. */}
      {thread.body && (
        <div className="mt-6 rounded-2xl border-l-2 border-accent border-t border-r border-b hairline bg-accent-soft/30 p-5 sm:p-6">
          {/* "OP" badge — signals this is the original post */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
              Original post
            </span>
          </div>
          {/* Body — larger font (text-base) + generous line-height for readability */}
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {thread.body}
          </div>
        </div>
      )}

      {/* ---- Replies section ---- */}
      {/* mt-16 gives clear visual separation between the OP and replies.
          The conversation structure should feel intentional, not stacked. */}
      <section className="mt-16">
        {/* Replies header — with a divider line for clear section break */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Replies ({replies.length})
          </h2>
          <div className="h-px flex-1 bg-border" aria-hidden />
        </div>

        {replies.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {replies.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border hairline bg-card px-5 py-4 shadow-premium-xs"
              >
                {/* Reply header — avatar + name + date */}
                <div className="flex items-center gap-2.5">
                  {/* Author avatar with initials */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                    {(r.author.name ?? "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {r.author.name ?? "Anonymous"}
                  </span>
                  <span aria-hidden className="text-border">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                {/* Reply body */}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed hairline bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            No replies yet. Be the first to respond.
          </p>
        )}

        {/* ---- Reply composer ---- */}
        {/* Client component — gates submission on auth status from /api/auth/status. */}
        <div className="mt-6">
          <ReplyComposer threadId={thread.id} locked={thread.locked} />
        </div>
      </section>
    </div>
  );
}
