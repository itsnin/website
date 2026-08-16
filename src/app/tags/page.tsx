import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { apiFetch, type TagCount } from "@/lib/api-client";

export default async function TagsPage() {
  const res = await apiFetch<TagCount[]>("/api/articles/tags");
  const tags = res.ok ? res.data : [];
  const hasTags = tags.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b hairline pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tags</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse articles by topic.
        </p>
      </div>

      {hasTags ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group inline-flex items-center gap-2 rounded-full border hairline bg-card px-4 py-2 text-sm font-medium text-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm"
            >
              <Tag className="h-3.5 w-3.5 text-accent" />
              {tag}
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        // empty state — no tags yet because no articles have been published
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed hairline bg-card px-6 py-16 text-center shadow-premium-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <Tag className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            No tags yet
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Tags will appear here once articles are published. Each article can
            have multiple tags for easy discovery.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
