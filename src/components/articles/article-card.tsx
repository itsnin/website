import Link from "next/link";
import { Clock, Calendar, Eye } from "lucide-react";
import type { ArticleSummary } from "@/lib/api-client";

interface ArticleCardProps {
  article: ArticleSummary;
}

function formatTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
}

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
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md"
    >
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

      <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h3>

      {article.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}

      {/* mt-auto pins meta to bottom of card */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {article.author.name ?? "NiN.X"}
        </span>
        <span aria-hidden className="text-border">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingMins} min
        </span>
        {/* views — only show if the field exists and is > 0 */}
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
