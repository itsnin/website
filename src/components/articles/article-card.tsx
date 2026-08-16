// ============================================================================
// article-card.tsx — a single article preview card for the grid. (v2 polished)
// ----------------------------------------------------------------------------
// Design refinements over v1:
//   - Soft layered shadow on hover instead of the default shadow
//   - Tags as proper accent-tinted pills (not grey chips)
//   - Clearer hierarchy: title bolder, excerpt muted, meta smaller + desaturated
//   - Subtle hover lift (translate-y) for a premium feel
//   - Reading-time icon + calendar icon for scannability
//
// Docs:
//   - Next.js Link: https://nextjs.org/docs/app/api-reference/components/link
// ==========================================================================
import Link from "next/link";
import { Clock, Calendar, Eye } from "lucide-react";
import type { ArticleSummary } from "@/lib/api-client";

interface ArticleCardProps {
  article: ArticleSummary;
}

// formatTags — splits the comma-separated tags string into a trimmed array.
// Returns at most 3 tags to keep the card tidy.
function formatTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
}

// formatDate — human-friendly date string.
// Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function ArticleCard({ article }: ArticleCardProps) {
  const tags = formatTags(article.tags);

  return (
    // The whole card is a link to the article detail page.
    // group + hover:shadow-premium-md gives a soft layered elevation on hover.
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md"
    >
      {/* Tags row (optional) — accent-tinted pills instead of grey chips */}
      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title — bolder (font-semibold) for clearer hierarchy.
          group-hover:text-accent shifts color on card hover. */}
      <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h3>

      {/* Excerpt — clamped to 2 lines, muted. */}
      {article.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}

      {/* Meta row — author + reading time + views + date. mt-auto pins it to the bottom.
          Desaturated (muted-foreground) and smaller (text-xs) so it reads as
          secondary info, per Apple's typographic hierarchy. */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {article.author.name ?? "NiN.X"}
        </span>
        <span aria-hidden className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingMins} min
        </span>
        {/* Views — only show if the field exists and is > 0. */}
        {"views" in article && typeof article.views === "number" && article.views > 0 && (
          <>
            <span aria-hidden className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
          </>
        )}
        <span aria-hidden className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(article.createdAt)}
        </span>
      </div>
    </Link>
  );
}
