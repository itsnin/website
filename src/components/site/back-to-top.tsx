// ============================================================================
// back-to-top.tsx — floating button that scrolls to the top of the page.
// ----------------------------------------------------------------------------
// Appears after the user scrolls down past ~600px. Clicking it smooth-scrolls
// back to the top. Hidden on short pages where there's nothing to scroll.
//
// Docs:
//   - window.scrollTo: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
//   - scroll behavior: https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
// ==========================================================================
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  // visible — controls whether the button is rendered.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // onScroll — toggles visibility based on scroll position.
    const onScroll = () => {
      // Show the button after scrolling past ~600px (roughly one viewport).
      setVisible(window.scrollY > 600);
    };

    // Passive listener for performance.
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scrollToTop — smooth-scrolls to the top.
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render nothing when not visible — keeps the DOM clean.
  if (!visible) return null;

  return (
    // Fixed to the bottom-right, above the footer. z-40 < header's z-50 so the
    // sticky header stays on top if they overlap.
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border hairline bg-card text-foreground shadow-premium-md transition-all hover:-translate-y-0.5 hover:shadow-premium-lg hover:text-accent"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
