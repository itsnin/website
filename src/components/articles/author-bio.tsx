import Link from "next/link";
import { Github, Twitter } from "lucide-react";

interface AuthorBioProps {
  authorName: string | null;
}

export function AuthorBio({ authorName }: AuthorBioProps) {
  const displayName = authorName ?? "NiN.X";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <section className="mt-12 rounded-2xl border hairline bg-card p-6 shadow-premium-xs sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-semibold text-accent">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Written by
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {displayName}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Developer building things in the open. This is a personal hub for
            projects, writing, and discussion. More details will be added here
            as the site grows.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="flex h-8 w-8 items-center justify-center rounded-full border hairline bg-background text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) profile"
              className="flex h-8 w-8 items-center justify-center rounded-full border hairline bg-background text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <Link
              href="/"
              className="ml-1 text-sm font-medium text-accent transition-opacity hover:opacity-80"
            >
              View all articles →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
