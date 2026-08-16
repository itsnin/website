import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t hairline bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:items-start">
          <div className="md:col-span-2">
            <p className="text-xl font-semibold tracking-tight">
              <span>NiN</span>
              <span className="text-accent">.X</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Development, writing, and discussion. A personal hub for the work
              I share openly.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="/contact"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer explore" className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </p>
            <Link href="/" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Articles
            </Link>
            <Link href="/tags" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Tags
            </Link>
            <Link href="/forum" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Forum
            </Link>
            <Link href="/shop" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Shop
            </Link>
          </nav>

          <nav aria-label="Footer connect" className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Connect
            </p>
            <Link href="/about" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              About
            </Link>
            <Link href="/contact" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Contact
            </Link>
            <Link href="/auth" className="text-sm text-foreground/80 transition-colors hover:text-accent">
              Sign in
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t hairline pt-6">
          <p className="text-xs text-muted-foreground">
            © {year} NiN.X. Built with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
