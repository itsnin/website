"use client";
import { useEffect, useState } from "react";
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // raf throttles to once per frame, avoids jank on long pages
    const onScroll = () => {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };
    // passive true so the listener cant block scroll events
    window.addEventListener("scroll", onScroll, { passive: true });
    // run once on mount so bar position is correct before any scroll
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const percent = Math.round(progress * 100);
  // hide badge at very top and bottom to avoid overlapping ui
  const showBadge = progress > 0.05 && progress < 0.99;
  return (
    <>
      {/* z-[60] above headers z-50 so progress bar stays visible */}
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
        <div
          className="reading-progress-bar h-full origin-left transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      {showBadge && (
        <div
          className="fixed bottom-20 right-6 z-40 hidden items-center gap-1.5 rounded-full border hairline bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-premium-sm backdrop-blur-sm sm:flex"
          aria-label={`Reading progress: ${percent}%`}
        >
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
