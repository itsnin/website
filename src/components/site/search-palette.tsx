// ============================================================================
// search-palette.tsx — global command-palette-style search.
// ----------------------------------------------------------------------------
// Opens via the header search button (which dispatches `ninx:open-search`) or
// via the Cmd/Ctrl+K keyboard shortcut. Queries the NestJS /api/search
// endpoint and shows live results from articles + forum threads.
//
// Docs:
//   - shadcn Dialog: https://ui.shadcn.com/docs/components/dialog
//   - Keyboard events: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
// ==========================================================================
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, MessageSquare, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiFetch, type SearchResult } from "@/lib/api-client";

export function SearchPalette() {
  // open — controls dialog visibility.
  const [open, setOpen] = useState(false);
  // query — the current search string.
  const [query, setQuery] = useState("");
  // results — the search response from the backend.
  const [results, setResults] = useState<SearchResult | null>(null);
  // loading — true while a request is in flight (for the spinner).
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // openPalette — exposed via a custom event so the header button can trigger it.
  // useEffect with no deps registers the listener once on mount.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ninx:open-search", handler);
    return () => window.removeEventListener("ninx:open-search", handler);
  }, []);

  // Cmd/Ctrl+K keyboard shortcut — standard pattern for command palettes.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // performSearch — debounced search. We use a 300ms delay so we don't hammer
  // the API on every keystroke. Implemented with a manual timeout + cleanup.
  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const res = await apiFetch<SearchResult>(`/api/search?q=${encodeURIComponent(q)}`);
    setLoading(false);
    if (res.ok) setResults(res.data);
  }, []);

  // Debounce the search call on every query change.
  useEffect(() => {
    const t = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, performSearch]);

  // navigate — closes the palette and routes to a result.
  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl border hairline p-0 shadow-premium-lg">
        <DialogHeader className="sr-only">
          {/* sr-only: visible to screen readers, hidden visually.
              Docs: https://tailwindcss.com/docs/screen-readers */}
          <DialogTitle>Search NiN.X</DialogTitle>
          <DialogDescription>Search articles and forum threads</DialogDescription>
        </DialogHeader>

        {/* Search input row — subtle accent on focus. */}
        <div className="flex items-center gap-3 border-b hairline px-4 py-3">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, threads…"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
          />
        </div>

        {/* Results list — scrolls if long. */}
        <div className="max-h-80 overflow-y-auto">
          {!results || query.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          ) : results.articles.length === 0 && results.threads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </p>
          ) : (
            <ul className="py-2">
              {results.articles.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => go(`/articles/${a.slug}`)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-secondary"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {a.title}
                      </span>
                      {a.excerpt && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {a.excerpt}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
              {results.threads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => go(`/forum/${t.id}`)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-secondary"
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {t.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Forum · {t.category}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
