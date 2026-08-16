// ============================================================================
// articles/[slug]/page.tsx — single article detail page. (v2 polished)
// ----------------------------------------------------------------------------
// Improvements over v1:
//   - Reading progress bar at the top of the viewport
//   - Syntax-highlighted code blocks via rehype-highlight + custom CodeBlock
//   - Copy-to-clipboard button on every code block
//   - Social share buttons (X / LinkedIn / copy link)
//   - "Keep reading" related-articles section at the bottom
//   - Constrained prose measure (handled by .prose-ninx CSS)
//
// Docs:
//   - react-markdown: https://github.com/remarkjs/react-markdown
//   - rehype-highlight: https://github.com/rehypejs/rehype-highlight
// ==========================================================================
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

// formatDate — full date for the article header.
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

  // Fetch the article by slug. 404 if not found or not published.
  const res = await apiFetch<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) notFound();

  const article = res.data;

  // Strip a leading markdown H1 (# Title) from the body if it matches the
  // article title. Many authors start their markdown with "# Title" which
  // would duplicate the page's <h1> (rendered above as the article header).
  // We compare the stripped heading text to the article title; if they match
  // (case-insensitive, trimmed), we remove that first line so only the page
  // header's <h1> remains.
  const stripRedundantTitle = (body: string, title: string): string => {
    const lines = body.split("\n");
    const firstLine = lines[0];
    const h1Match = /^#\s+(.+)$/.exec(firstLine);
    if (h1Match) {
      const headingText = h1Match[1].trim().toLowerCase();
      if (headingText === title.trim().toLowerCase()) {
        // Remove the first line (and any immediately following blank line).
        const rest = lines.slice(1);
        if (rest[0]?.trim() === "") rest.shift();
        return rest.join("\n");
      }
    }
    return body;
  };

  const cleanBody = article.body ? stripRedundantTitle(article.body, article.title) : "";

  // Construct the canonical absolute URL for share intents. In production
  // this would come from env; in dev we use the localhost gateway.
  const shareUrl = `https://nin.x/articles/${article.slug}`;

  return (
    <>
      {/* Reading progress bar — fixed at the very top of the viewport. */}
      <ReadingProgress />

      {/* Wider container (max-w-5xl) to accommodate the two-column layout:
          article body + TOC sidebar. The body itself is constrained by
          prose-ninx's max-width (68ch) for readability. */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        {/* ---- Article header ---- */}
        <article className="mt-6">
          {/* Tags */}
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

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1]">
            {article.title}
          </h1>

          {/* Meta row + share buttons — with author avatar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b hairline pb-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* Author avatar circle with initial */}
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
              {/* Views — only show if > 0 (new articles start at 0). */}
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
            {/* Share buttons — client component */}
            <ShareButtons url={shareUrl} title={article.title} />
          </div>

          {/* Abstract / dek — a 1-2 line summary displayed below the meta row
              and above the body. Classic editorial typography pattern that gives
              the reader a scannable preview before committing to the full text.
              Uses the article's `excerpt` field; renders larger + bolder than
              body text but smaller than the title. */}
          {article.excerpt && (
            <p className="mt-6 text-lg font-medium leading-relaxed text-foreground/80 sm:text-xl">
              {article.excerpt}
            </p>
          )}

          {/* Cover image (optional) */}
          {article.coverImage && (
            <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-secondary shadow-premium-sm">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* ---- Article body — two-column layout with TOC sidebar ---- */}
          {/* On large screens: article body (left) + sticky TOC (right).
              On smaller screens: TOC is hidden (the TableOfContents component
              handles the `hidden lg:block` itself). */}
          <div className="mt-8 flex gap-12">
            {/* Article body — rendered from markdown.
                Uses `cleanBody` which has a redundant leading # Title stripped
                if it matched the article title (avoids duplicate h1). */}
            <div className="prose-ninx min-w-0 flex-1">
              {cleanBody ? (
                <ReactMarkdown
                  // rehype-plugins:
                  //   - rehypeSlug: adds id attributes to headings (for TOC anchors)
                  //   - rehypeHighlight: syntax-highlight fenced code blocks
                  // Docs: https://github.com/rehypejs/rehype-slug
                  rehypePlugins={[rehypeSlug, rehypeHighlight]}
                  components={{
                    // CodeBlock — custom renderer for fenced code blocks (copy button).
                    code: CodeBlock,
                    // h1 → h2 — demote any remaining markdown h1 to h2 so the
                    // page has exactly one <h1> (the article title above).
                    // Docs: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements
                    h1: ({ node: _node, ...props }) => <h2 {...props} />,
                  }}
                >
                  {cleanBody}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">This article has no content yet.</p>
              )}
            </div>

            {/* TOC sidebar — sticky, only on large screens. */}
            {/* `w-56 shrink-0` gives it a fixed width; `sticky top-24` keeps it
                visible as the user scrolls (24 = 16rem header height + spacing). */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-24">
                <TableOfContents markdown={cleanBody} />
              </div>
            </aside>
          </div>
        </article>

        {/* ---- Related articles ---- */}
        <RelatedArticles slug={article.slug} />

        {/* ---- Prev/next navigation ---- */}
        <ArticleNav slug={article.slug} />

        {/* ---- Author bio ---- */}
        <AuthorBio authorName={article.author.name} />

        {/* ---- Back to top link ---- */}
        <BackToTopLink />
      </div>
    </>
  );
}
