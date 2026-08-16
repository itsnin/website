// ============================================================================
// article-nav.tsx — prev/next article navigation at the bottom of article pages.
// ----------------------------------------------------------------------------
// Server Component. Fetches the prev/next published articles (by createdAt)
// from the NestJS API and renders a two-column navigation row. Each side shows
// a directional label + the article title. If there's no prev or next, that
// side renders a muted placeholder so the layout stays balanced.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiFetch, type ArticleNeighbors } from "@/lib/api-client";

interface ArticleNavProps {
  // slug — the current article's slug, used to fetch its neighbors.
  slug: string;
}

export async function ArticleNav({ slug }: ArticleNavProps) {
  // Fetch prev/next articles.
  const res = await apiFetch<ArticleNeighbors>(
    `/api/articles/${encodeURIComponent(slug)}/neighbors`,
  );
  const { prev, next } = res.ok ? res.data : { prev: null, next: null };

  return (
    // Two-column grid: prev on the left, next on the right.
    <nav
      aria-label="Article navigation"
      className="mt-12 grid gap-4 border-t hairline pt-8 sm:grid-cols-2"
    >
      {/* Previous article (left side) */}
      {prev ? (
        <Link
          href={`/articles/${prev.slug}`}
          className="group flex flex-col rounded-xl border hairline bg-card p-4 shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm"
        >
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="mt-1.5 font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        // Placeholder when there's no previous article — keeps the grid balanced.
        <div className="flex flex-col rounded-xl border border-dashed hairline bg-background p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
            Previous
          </span>
          <span className="mt-1.5 text-sm text-muted-foreground/50">
            This is the oldest article.
          </span>
        </div>
      )}

      {/* Next article (right side) — text aligned right on desktop. */}
      {next ? (
        <Link
          href={`/articles/${next.slug}`}
          className="group flex flex-col rounded-xl border hairline bg-card p-4 text-right shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm sm:items-end"
        >
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Next
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1.5 font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex flex-col rounded-xl border border-dashed hairline bg-background p-4 text-right sm:items-end">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
            Next
          </span>
          <span className="mt-1.5 text-sm text-muted-foreground/50">
            This is the latest article.
          </span>
        </div>
      )}
    </nav>
  );
}
