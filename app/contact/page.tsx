// ============================================================================
// contact/page.tsx — contact page with polished interaction cards.
// ----------------------------------------------------------------------------
// Instead of generic "coming soon" placeholders, this page uses high-fidelity
// cards with accent-colored icons, hover states, and intentional "coming soon"
// badges where the real data isn't configured yet. Each card is a clear
// actionable path to reach out.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import Link from "next/link";
import { Mail, MessageSquare, Github, ArrowUpRight, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* ---- Page header ---- */}
      <div className="border-b hairline pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ways to reach out. Pick what works for you.
        </p>
      </div>

      {/* ---- Contact cards ---- */}
      {/* Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Email card — with a "coming soon" badge since the address isn't set */}
        <div className="group flex flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all hover:-translate-y-1 hover:shadow-premium-md">
          {/* Icon circle in accent */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <Mail className="h-5 w-5 text-accent" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">Email</h3>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
            For questions, feedback, or private messages. A contact address will
            be listed here soon.
          </p>
          {/* "Coming soon" badge — intentional, styled, not "missing data" */}
          <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3 w-3" />
            Coming soon
          </div>
        </div>

        {/* Forum card — fully functional, links to /forum */}
        <Link
          href="/forum"
          className="group flex flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all hover:-translate-y-1 hover:shadow-premium-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <MessageSquare className="h-5 w-5 text-accent" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">Forum</h3>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
            The fastest way to get a response. Open discussions for everyone —
            anyone can read, signed-in users can post.
          </p>
          {/* Active link indicator with arrow */}
          <div className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-accent transition-opacity group-hover:opacity-80">
            Visit forum
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>

        {/* GitHub card — links to GitHub profile */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-2xl border hairline bg-card p-6 shadow-premium-xs transition-all hover:-translate-y-1 hover:shadow-premium-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <Github className="h-5 w-5 text-accent" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">GitHub</h3>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
            Browse the code, open issues, or contribute. The owner&apos;s GitHub
            handle will be configured soon.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-accent transition-opacity group-hover:opacity-80">
            View profile
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </a>
      </div>

      {/* ---- Footer note ---- */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        A contact form may be added once authentication is available.
      </p>
    </div>
  );
}
