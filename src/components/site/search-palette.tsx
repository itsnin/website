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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // openpalette — exposed via a custom event so the header button can trigger it
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ninx:open-search", handler);
    return () => window.removeEventListener("ninx:open-search", handler);
  }, []);

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

  // performsearch — debounced search. we use a 300ms delay so we don't hammer
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

  useEffect(() => {
    const t = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, performSearch]);

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
          {/* sr-only keeps header accessible to screen readers */}
          <DialogTitle>Search NiN.X</DialogTitle>
          <DialogDescription>Search articles and forum threads</DialogDescription>
        </DialogHeader>

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
