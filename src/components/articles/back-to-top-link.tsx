"use client";

import { ArrowUp } from "lucide-react";

export function BackToTopLink() {
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
