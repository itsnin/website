"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    // fixed to the bottom-right, above the footer. z-40 < header's z-50 so the
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border hairline bg-card text-foreground shadow-premium-md transition-all hover:-translate-y-0.5 hover:shadow-premium-lg hover:text-accent"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
