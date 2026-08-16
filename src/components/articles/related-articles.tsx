import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { apiFetch, type RelatedArticle } from "@/lib/api-client";

interface RelatedArticlesProps {
  slug: string;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export async function RelatedArticles({ slug }: RelatedArticlesProps) {
  const res = await apiFetch<RelatedArticle[]>(
    `/api/articles/${encodeURIComponent(slug)}/related`,
  );
  const related = res.ok ? res.data : [];

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t hairline pt-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Keep reading
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Related articles you might like.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((a) => (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className="group flex flex-col rounded-xl border hairline bg-card p-5 shadow-premium-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-sm"
          >
            {a.tags && (
              <div className="mb-2 flex flex-wrap gap-1">
                {a.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            <h3 className="font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
              {a.title}
            </h3>

            {a.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {a.excerpt}
              </p>
            )}

            <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(a.createdAt)}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {a.readingMins} min
              </span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
