// ============================================================================
// popular-tags.tsx — compact tag cloud for the home page.
// ----------------------------------------------------------------------------
// Server Component. Fetches all tags with counts and renders the top N as
// small pills linking to /tags/[tag]. Gives the home page more content
// discoverability without taking much vertical space.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { apiFetch, type TagCount } from "@/lib/api-client";

export async function PopularTags() {
  // Fetch all tags (already sorted by count desc in the service).
  const res = await apiFetch<TagCount[]>("/api/articles/tags");
  const tags = res.ok ? res.data : [];

  // Don't render the section if there are no tags yet.
  if (tags.length === 0) return null;

  // Show up to 8 tags.
  const topTags = tags.slice(0, 8);

  return (
    <section className="border-t hairline bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Header row — title + "browse all" link */}
        <div className="flex items-end justify-between border-b hairline pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Browse by tag
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore articles by topic.
            </p>
          </div>
          <Link
            href="/tags"
            className="hidden items-center gap-1 text-sm font-medium text-accent transition-opacity hover:opacity-80 sm:inline-flex"
          >
            All tags
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tag pills — flex-wrap so they flow nicely on any width. */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {topTags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group inline-flex items-center gap-1.5 rounded-full border hairline bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm"
            >
              <Tag className="h-3.5 w-3.5 text-accent" />
              {tag}
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
