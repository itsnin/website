import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Github, MessageSquare, Mail } from "lucide-react";
import { apiFetch, type PaginatedArticles, type SiteStats } from "@/lib/api-client";
import { ArticleCard } from "@/components/articles/article-card";
import { GithubShowcase } from "@/components/github/github-showcase";
import { StatsBanner } from "@/components/site/stats-banner";
import { NewsletterSignup } from "@/components/site/newsletter-signup";
import { PopularTags } from "@/components/articles/popular-tags";
import { HeroVisual } from "@/components/site/hero-visual";
import { PopularArticles } from "@/components/articles/popular-articles";
import { LatestThreads } from "@/components/forum/latest-threads";

export default async function Home() {
  const [articlesRes, statsRes] = await Promise.all([
    apiFetch<PaginatedArticles>("/api/articles?page=1&pageSize=12"),
    apiFetch<SiteStats>("/api/stats"),
  ]);
  const articles = articlesRes.ok ? articlesRes.data.items : [];
  const stats = statsRes.ok ? statsRes.data : { articles: 0, threads: 0, replies: 0, repos: 0, totalStars: 0, totalViews: 0 };
  const hasArticles = articles.length > 0;

  return (
    <div>
      
      <section className="relative overflow-hidden">
        {/* herovisual — decorative svg layers (glow, arcs, dots, orb) absolutely positioned at z-0; content below sits at z-10 */}
        <HeroVisual />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border hairline bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-premium-xs backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Development · Writing · Discussion
            </div>

            <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]">
              Building things,
              <br />
              <span className="text-accent">writing them down.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-muted-foreground">
              A personal corner for development projects, technical articles, and
              community discussion. Take a look around.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#articles"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-premium-sm transition-all hover:shadow-premium-md hover:-translate-y-0.5"
              >
                Read articles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-premium-xs transition-all hover:shadow-premium-sm hover:-translate-y-0.5"
              >
                Visit the forum
              </Link>
            </div>
          </div>

          <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <StatsBanner stats={stats} />
          </div>
        </div>
      </section>

      <section id="articles" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between border-b hairline pb-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Latest articles
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh writing on development and engineering.
            </p>
          </div>
          <BookOpen className="hidden h-5 w-5 text-muted-foreground sm:block" />
        </div>

        {hasArticles ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <div
                key={article.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyArticles />
        )}
      </section>

      <PopularTags />

      <PopularArticles />

      <LatestThreads />

      <GithubShowcase />

      <NewsletterSignup />
    </div>
  );
}

function EmptyArticles() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed hairline bg-card px-6 py-16 text-center shadow-premium-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <BookOpen className="h-6 w-6 text-accent" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        Articles are coming soon
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The article system is fully wired up and ready. New writing will appear
        here as soon as it&apos;s published. In the meantime, explore the forum
        or check out the GitHub projects.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <MessageSquare className="h-4 w-4" />
          Go to forum
        </Link>
        <Link
          href="/#github"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Github className="h-4 w-4" />
          See GitHub projects
        </Link>
      </div>
    </div>
  );
}
