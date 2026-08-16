// ============================================================================
// author-bio.tsx — author bio card at the bottom of articles.
// ----------------------------------------------------------------------------
// Renders a compact card with the author's avatar, name, role, and a short bio.
// Since the real bio isn't configured yet, we show a tasteful placeholder that
// explains who NiN.X is without inventing fake personal details.
//
// This gives the bottom of article pages a sense of "written by a person"
// rather than ending abruptly after the prev/next nav.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { Github, Twitter } from "lucide-react";

interface AuthorBioProps {
  // authorName — from the article's author relation (may be null).
  authorName: string | null;
}

export function AuthorBio({ authorName }: AuthorBioProps) {
  // displayName — fall back to "NiN.X" if the author name is null.
  const displayName = authorName ?? "NiN.X";
  // initial — first letter of the display name, for the avatar circle.
  const initial = displayName.charAt(0).toUpperCase();

  return (
    // Card container — accent-tinted left border to distinguish from article body.
    <section className="mt-12 rounded-2xl border hairline bg-card p-6 shadow-premium-xs sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar — large circle with the author's initial in accent */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-semibold text-accent">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          {/* "Written by" label */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Written by
          </p>
          {/* Author name */}
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {displayName}
          </h3>
          {/* Bio — honest placeholder, no fake personal details. */}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Developer building things in the open. This is a personal hub for
            projects, writing, and discussion. More details will be added here
            as the site grows.
          </p>

          {/* Social links — GitHub + Twitter, matching the footer */}
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
            {/* "View all articles" link — leads back to the home feed */}
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
