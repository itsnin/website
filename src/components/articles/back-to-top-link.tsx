// ============================================================================
// back-to-top-link.tsx — "Back to top" link for the article footer.
// ----------------------------------------------------------------------------
// A simple, accessible link that smooth-scrolls to the top of the page when
// clicked. Placed at the bottom of article pages after the author bio, giving
// readers a clear way to return to the top after reading a long article.
//
// Docs:
//   - window.scrollTo: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
// ==========================================================================
"use client";

import { ArrowUp } from "lucide-react";

export function BackToTopLink() {
  // scrollToTop — smooth-scrolls to the top of the page.
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={scrollToTop}
        className="inline-flex items-center gap-1.5 rounded-full border hairline bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
        aria-label="Back to top"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        Back to top
      </button>
    </div>
  );
}
