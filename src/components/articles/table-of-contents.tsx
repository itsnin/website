// a client component because it uses scroll tracking + dom apis
"use client";

import { useEffect, useState, useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

interface TableOfContentsProps {
  markdown: string;
}

// react-markdown doesn't auto-generate ids by default, so we add them
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// returns an array of { id, text, level }. we skip h1 because the article
function extractHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const headings: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // track code fences so we don't match # inside code blocks
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

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
  // headings — memoized so we only parse the markdown once
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      // rootmargin: offset the trigger zone so the active heading updates
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="hidden rounded-2xl border hairline bg-secondary/40 p-5 shadow-premium-xs lg:block"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="mt-4 space-y-0.5">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id} className="relative">
              
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                />
              )}
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
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
