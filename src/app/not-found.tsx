// cannot pass functions to client-rendered children
"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-7xl font-semibold tracking-tight text-accent sm:text-8xl">404</p>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        This page wandered off
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Try a search, or head back to the articles.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-premium-sm transition-all hover:-translate-y-0.5 hover:shadow-premium-md"
        >
          <Home className="h-4 w-4" />
          Back home
        </Link>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("nin:open-search"))}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:shadow-premium-sm"
        >
          <Search className="h-4 w-4" />
          Search the site
        </button>
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Or go back to where you came from
      </button>
    </div>
  );
}
