// ============================================================================
// popular-articles.tsx — "Most read" section on the home page.
// ----------------------------------------------------------------------------
// Server Component. Fetches the top 3 most-viewed published articles from the
// NestJS API and renders them as a compact numbered list. Only renders if there
// are articles with views > 0 (so it's empty on a fresh site).
//
// Design: a horizontal strip of 3 cards, each with a rank number, title,
// excerpt, views count, and relative time. Gives the home page a sense of
// "what's popular" without taking much vertical space.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { Eye, TrendingUp, ArrowRight } from "lucide-react";
import { apiFetch, type PopularArticle } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/relative-time";

export async function PopularArticles() {
  // Fetch the top 3 most-viewed articles.
  const res = await apiFetch<PopularArticle[]>("/api/articles/popular");
  const articles = res.ok ? res.data : [];

  // Don't render the section if no articles have views yet.
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Section header — with a "TrendingUp" icon to signal popularity */}
      <div className="flex items-end justify-between border-b hairline pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <TrendingUp className="h-5 w-5 text-accent" />
            Most read
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What others are reading right now.
          </p>
        </div>
      </div>

      {/* Numbered article cards — 3 columns on desktop, 1 on mobile */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group relative flex flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all hover:-translate-y-1 hover:shadow-premium-md"
          >
            {/* Rank number — large, muted, top-right of the card.
                Uses the accent color at low opacity for a subtle highlight. */}
            <span className="absolute right-5 top-4 text-5xl font-bold text-accent/10 transition-colors group-hover:text-accent/20">
              {index + 1}
            </span>

            {/* Tags (if any) */}
            {article.tags && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {article.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
              {article.title}
            </h3>

            {/* Excerpt — 2 lines */}
            {article.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            )}

            {/* Meta row — views + relative time. mt-auto pins to bottom. */}
            <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium text-accent">
                <Eye className="h-3.5 w-3.5" />
                {article.views} {article.views === 1 ? "view" : "views"}
              </span>
              <span aria-hidden className="text-border">·</span>
              <span>{formatRelativeTime(article.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
