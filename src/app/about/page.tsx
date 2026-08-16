import Link from "next/link";
import { User, Sparkles, Code2, ArrowRight, Clock, Github, Twitter } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b hairline pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">About</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The person behind NiN.X.
        </p>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
            <User className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Bio</h2>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border hairline bg-card shadow-premium-sm">
          <div
            aria-hidden
            className="h-20 w-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.5 0.11 200 / 0.15), oklch(0.62 0.11 230 / 0.10))",
            }}
          />
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-accent-soft text-3xl font-semibold text-accent shadow-premium-sm">
              N
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">NiN.X</h3>
              <p className="mt-1 text-sm font-medium text-accent">Developer · Writer · Open source</p>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Hi — I build things in the open and write about the process.
              This site is a personal hub for development projects, technical
              articles, and community discussion. A more detailed bio will
              land here as the site grows.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Currently building NiN.X
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border hairline bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                >
                  <Github className="h-3 w-3" />
                  GitHub
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border hairline bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                >
                  <Twitter className="h-3 w-3" />
                  X
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Focus areas</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {["Development", "Writing", "Open source"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border hairline bg-card p-5 shadow-premium-xs"
            >
              <div className="h-2.5 w-1/2 rounded bg-secondary" />
              <div className="mt-3 h-2 w-full rounded bg-secondary/60" />
              <div className="mt-2 h-2 w-4/5 rounded bg-secondary/40" />
              <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          What this site focuses on will be detailed here.
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft">
            <Code2 className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Stack</h2>
        </div>
        <div className="mt-4 rounded-2xl border hairline bg-card p-6 shadow-premium-xs">
          <div className="flex flex-wrap gap-2">
            {["Next.js", "NestJS", "TypeScript", "Prisma", "Tailwind", "React"].map((tech) => (
              <span
                key={tech}
                className="rounded-full border hairline bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            The full technology stack will be documented here.
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed hairline bg-card p-6 text-center shadow-premium-xs sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-accent" />
          This section is a work in progress.
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Read the articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
