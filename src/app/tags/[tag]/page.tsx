import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { apiFetch, type PaginatedArticles } from "@/lib/api-client";
import { ArticleCard } from "@/components/articles/article-card";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const res = await apiFetch<PaginatedArticles>(
    `/api/articles/by-tag/${encodeURIComponent(decodedTag)}?page=1&pageSize=20`,
  );
  const articles = res.ok ? res.data.items : [];
  const hasArticles = articles.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/tags"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All tags
      </Link>

      <div className="mt-6 border-b hairline pb-6">
        <div className="flex items-center gap-2 text-accent">
          <Tag className="h-5 w-5" />
          <span className="text-sm font-medium">Tag</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {decodedTag}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {articles.length} article{articles.length !== 1 ? "s" : ""} tagged with “{decodedTag}”.
        </p>
      </div>

      {hasArticles ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed hairline bg-card px-6 py-16 text-center shadow-premium-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <Tag className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            No articles with this tag
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            There are no published articles tagged “{decodedTag}” yet.
          </p>
          <Link
            href="/tags"
            className="mt-6 inline-flex items-center gap-2 rounded-full border hairline bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Browse all tags
          </Link>
        </div>
      )}
    </div>
  );
}
