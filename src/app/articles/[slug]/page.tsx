import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { apiFetch, type ArticleDetail } from "@/lib/api-client";
import { ReadingProgress } from "@/components/site/reading-progress";
import { CodeBlock } from "@/components/articles/code-block";
import { ShareButtons } from "@/components/articles/share-buttons";
import { RelatedArticles } from "@/components/articles/related-articles";
import { TableOfContents } from "@/components/articles/table-of-contents";
import { ArticleNav } from "@/components/articles/article-nav";
import { AuthorBio } from "@/components/articles/author-bio";
import { BackToTopLink } from "@/components/articles/back-to-top-link";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await apiFetch<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) notFound();

  const article = res.data;

  // would duplicate the page's <h1> (rendered above as the article header)
  // (case-insensitive, trimmed), we remove that first line so only the page
  const stripRedundantTitle = (body: string, title: string): string => {
    const lines = body.split("\n");
    const firstLine = lines[0];
    const h1Match = /^#\s+(.+)$/.exec(firstLine);
    if (h1Match) {
      const headingText = h1Match[1].trim().toLowerCase();
      if (headingText === title.trim().toLowerCase()) {
        const rest = lines.slice(1);
        if (rest[0]?.trim() === "") rest.shift();
        return rest.join("\n");
      }
    }
    return body;
  };

  const cleanBody = article.body ? stripRedundantTitle(article.body, article.title) : "";

  // this would come from env; in dev we use the localhost gateway
  const shareUrl = `https://nin.x/articles/${article.slug}`;

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <article className="mt-6">
          {article.tags && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {article.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
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

          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b hairline pb-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {(article.author.name ?? "N").charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground/80">
                  {article.author.name ?? "NiN.X"}
                </span>
              </div>
              <span aria-hidden className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.createdAt)}
              </span>
              <span aria-hidden className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readingMins} min read
              </span>
              {/* views — only show if > 0 (new articles start at 0) */}
              {"views" in article && typeof article.views === "number" && article.views > 0 && (
                <>
                  <span aria-hidden className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.views} {article.views === 1 ? "view" : "views"}
                  </span>
                </>
              )}
            </div>
            <ShareButtons url={shareUrl} title={article.title} />
          </div>

          {article.excerpt && (
            <p className="mt-6 text-lg font-medium leading-relaxed text-foreground/80 sm:text-xl">
              {article.excerpt}
            </p>
          )}

          {article.coverImage && (
            <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-secondary shadow-premium-sm">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8 flex gap-12">
            
            <div className="prose-ninx min-w-0 flex-1">
              {cleanBody ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeSlug, rehypeHighlight]}
                  components={{
                    code: CodeBlock,
                    // h1 → h2 — demote any remaining markdown h1 to h2 so the
                    h1: ({ node: _node, ...props }) => <h2 {...props} />,
                  }}
                >
                  {cleanBody}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">This article has no content yet.</p>
              )}
            </div>

            {/* `w-56 shrink-0` gives it a fixed width; `sticky top-24` keeps it visible as the user scrolls (24 = 16rem header height + spacing) */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-24">
                <TableOfContents markdown={cleanBody} />
              </div>
            </aside>
          </div>
        </article>

        <RelatedArticles slug={article.slug} />

        <ArticleNav slug={article.slug} />

        <AuthorBio authorName={article.author.name} />

        <BackToTopLink />
      </div>
    </>
  );
}
