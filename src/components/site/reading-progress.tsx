// ============================================================================
// reading-progress.tsx — top-of-page scroll progress indicator with percentage.
// ----------------------------------------------------------------------------
// A thin teal bar fixed to the top of the viewport that fills as the user
// scrolls down the page. Also shows a small percentage badge in the bottom-right
// corner that appears after the user scrolls past 5%. Uses requestAnimationFrame
// for smooth, cheap updates.
//
// Docs:
//   - scroll event: https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event
//   - requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// ==========================================================================
"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  // progress — 0 to 1, mapped to the bar's scaleX transform.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // onScroll — computes the scroll fraction and updates state. Wrapped in
    // rAF so we don't run more than once per frame (perf on long pages).
    const onScroll = () => {
      requestAnimationFrame(() => {
        // scrollTop — how far we've scrolled down.
        const scrollTop = window.scrollY;
        // scrollHeight — total page height.
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        // Guard against divide-by-zero on very short pages.
        const p = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };

    // Passive listener — doesn't block scrolling. Docs: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive
    window.addEventListener("scroll", onScroll, { passive: true });
    // Call once on mount so the bar is correct before any scroll happens.
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // percent — rounded integer for the badge display.
  const percent = Math.round(progress * 100);
  // showBadge — only show the percentage badge after 5% scroll (to avoid
  // showing "0%" / "1%" at the very top, which feels noisy).
  const showBadge = progress > 0.05 && progress < 0.99;

  return (
    <>
      {/* Top progress bar — fixed to the very top, above the sticky header
          (z-[60] > header's z-50). The inner bar uses scaleX to represent progress. */}
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
        <div
          // scaleX(0) by default; transform-origin left so it grows from the left.
          // transition gives a tiny smoothing so it doesn't feel jittery.
          className="reading-progress-bar h-full origin-left transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Percentage badge — bottom-right corner, appears after 5% scroll.
          Fixed position, above content (z-40 < header so they don't overlap). */}
      {showBadge && (
        <div
          className="fixed bottom-20 right-6 z-40 hidden items-center gap-1.5 rounded-full border hairline bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-premium-sm backdrop-blur-sm sm:flex"
          aria-label={`Reading progress: ${percent}%`}
        >
          {/* Small circular progress indicator */}
          <svg className="h-3.5 w-3.5 -rotate-90" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="oklch(0.875 0.004 247)" strokeWidth="3" />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress)}`}
              strokeLinecap="round"
            />
          </svg>
          {percent}%
        </div>
      )}
    </>
  );
}
