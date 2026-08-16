// ============================================================================
// github-showcase.tsx — server component showing the owner's GitHub repos. (v2)
// ----------------------------------------------------------------------------
// Improvements:
//   - Section gets its own subtle background tint to separate from articles
//   - Repo cards: accent-tinted topic pills, softer shadows, better hierarchy
//   - "View all on GitHub" CTA when repos exist
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { Star, GitFork, ExternalLink, Github, ArrowUpRight } from "lucide-react";
import { apiFetch, type GithubRepo } from "@/lib/api-client";

// formatUpdatedAt — relative-ish date for repo cards.
function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

// languageColor — returns a tailwind bg class for common languages so the
// language dot has a familiar color. Falls back to muted for unknown langs.
function languageColor(lang: string | null): string {
  switch (lang) {
    case "TypeScript":
      return "bg-blue-400";
    case "JavaScript":
      return "bg-yellow-400";
    case "Python":
      return "bg-green-500";
    case "Rust":
      return "bg-orange-500";
    case "Go":
      return "bg-cyan-400";
    case "HTML":
      return "bg-red-400";
    default:
      return "bg-muted-foreground";
  }
}

export async function GithubShowcase() {
  const res = await apiFetch<GithubRepo[]>("/api/github/repos");
  const repos = res.ok ? res.data : [];
  const hasRepos = repos.length > 0;

  return (
    <section id="github" className="border-t hairline bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Section header — with a "view all" CTA when repos exist */}
        <div className="flex items-end justify-between border-b hairline pb-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              GitHub projects
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open-source work and experiments.
            </p>
          </div>
          {hasRepos && (
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 text-sm font-medium text-accent transition-opacity hover:opacity-80 sm:inline-flex"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {!hasRepos && <Github className="hidden h-5 w-5 text-muted-foreground sm:block" />}
        </div>

        {/* Repo grid OR placeholder */}
        {hasRepos ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {repos.slice(0, 6).map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-md"
              >
                {/* Repo name + external link icon */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
                    {repo.name}
                  </h3>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Description */}
                {repo.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {repo.description}
                  </p>
                )}

                {/* Topics — accent-tinted pills */}
                {repo.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta row — language + stars + forks + updated date.
                    mt-auto pins bottom for consistent card heights. */}
                <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${languageColor(repo.language)}`}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {repo.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks_count}
                  </span>
                  <span className="ml-auto">{formatUpdatedAt(repo.updated_at)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          // Placeholder — no GitHub username configured yet.
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed hairline bg-card px-6 py-12 text-center shadow-premium-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <Github className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              GitHub projects will appear here
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The owner&apos;s GitHub handle hasn&apos;t been configured yet.
              Once set, live repository cards will show up in this section.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
