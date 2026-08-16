// ============================================================================
// table-of-contents.tsx — sticky TOC sidebar for long articles.
// ----------------------------------------------------------------------------
// Extracts h2/h3 headings from the article's markdown body, renders them as
// a clickable outline, and highlights the currently-scrolled-to section.
//
// This is a Client Component because it uses scroll tracking + DOM APIs.
//
// Docs:
//   - IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
//   - scroll tracking pattern: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#scroll_tracking
// ==========================================================================
"use client";

import { useEffect, useState, useMemo } from "react";

// TocItem — a single heading entry in the table of contents.
interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

interface TableOfContentsProps {
  // markdown — the article body, used to extract headings.
  markdown: string;
}

// slugify — generates a URL-safe id from heading text, matching the
// convention that GitHub-style markdown uses for heading anchors.
// react-markdown doesn't auto-generate ids by default, so we add them
// via a rehype plugin (rehype-slug) — but for the TOC we parse them here.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// extractHeadings — parses the markdown source for h2 (##) and h3 (###) lines.
// Returns an array of { id, text, level }. We skip h1 because the article
// title is rendered separately and markdown h1s are demoted to h2.
function extractHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const headings: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Track code fences so we don't match # inside code blocks.
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Match ## or ### (but not # which is h1, or ####+ which is too deep).
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (match) {
      const level = match[1].length; // 2 or 3
      const text = match[2].trim();
      headings.push({ id: slugify(text), text, level });
    }
  }
  return headings;
}

export function TableOfContents({ markdown }: TableOfContentsProps) {
  // headings — memoized so we only parse the markdown once.
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  // activeId — the id of the heading currently in view. Used for highlighting.
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Don't run if there are fewer than 2 headings — a TOC isn't useful.
    if (headings.length < 2) return;

    // IntersectionObserver — watches when heading elements enter/leave the
    // viewport. We set the active heading to the last one that crossed above
    // the top threshold.
    // Docs: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost entry that's currently intersecting.
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      // rootMargin: offset the trigger zone so the active heading updates
      // slightly before the heading reaches the very top of the viewport.
      // Docs: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    // Observe each heading element by id.
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  // Don't render a TOC if there are fewer than 2 headings.
  if (headings.length < 2) return null;

  // handleClick — smooth-scrolls to the heading, accounting for the sticky
  // header height (64px) via scroll-margin-top (set in globals.css).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update the URL hash without jumping, for shareability.
      // Docs: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    // Sticky nav — stays in the sidebar as the user scrolls.
    // `hidden lg:block` hides it on mobile/tablet (no room for a sidebar).
    // Styled as a "floating panel": light background, rounded corners, subtle
    // shadow, generous padding. Feels like premium navigation, not an afterthought.
    <nav
      aria-label="Table of contents"
      className="hidden rounded-2xl border hairline bg-secondary/40 p-5 shadow-premium-xs lg:block"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="mt-4 space-y-0.5">
        {headings.map((h) => {
          // isActive — whether this heading is currently in view.
          const isActive = activeId === h.id;
          return (
            <li key={h.id} className="relative">
              {/* Active indicator bar — a vertical accent line on the left
                  that appears when the heading is active. Mimics Apple's
                  documentation sidebar style. */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                />
              )}
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                // Indent h3s more than h2s for visual hierarchy.
                // leading-7 for generous line-height (premium readability).
                className={`block rounded-md py-1.5 pl-4 text-sm leading-7 transition-colors ${
                  h.level === 3 ? "pl-7" : "pl-4"
                } ${
                  isActive
                    ? "font-medium text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
