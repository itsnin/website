// ============================================================================
// site-header.tsx — sticky, frosted-glass navigation bar.
// ----------------------------------------------------------------------------
// Design notes:
//   - Uses `glass-panel` (backdrop-blur) for the Apple translucency effect.
//   - Sticky to top with a hairline border on scroll.
//   - Contains: wordmark, primary nav, search trigger, auth button.
//   - Mobile: collapses nav into a Sheet (hamburger menu).
//
// Docs:
//   - Next.js Link: https://nextjs.org/docs/app/api-reference/components/link
//   - shadcn Sheet: https://ui.shadcn.com/docs/components/sheet
// ==========================================================================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

// NAV_LINKS — the primary navigation. Each entry maps to a route segment.
// We deliberately omit "pricing/dashboard" per the user's requirements.
const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/", label: "Articles" },
  { href: "/forum", label: "Forum" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  // usePathname lets us highlight the active nav link.
  // Docs: https://nextjs.org/docs/app/api-reference/functions/use-pathname
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // scrolled — true when the user has scrolled down past the very top. We use
  // this to intensify the header's border/shadow slightly, giving the page a
  // more "layered" feel once content starts passing under the header.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // isActive — a link is "active" if the current path starts with its href.
  // The home "/" is special-cased to avoid matching every route.
  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    // <header> is sticky to the top. `glass-panel` gives the frosted look.
    // z-50 ensures it sits above page content. The border + shadow intensify
    // slightly once the user scrolls (scrolled state).
    <header
      className={`glass-panel sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? "border-b hairline shadow-premium-xs" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* ---- Wordmark ---- */}
        {/* Link to home. The wordmark uses tight letter-spacing for a premium feel. */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground"
          aria-label="NiN.X home"
        >
          {/* The "X" gets the teal accent to tie into the 3rd-tier accent color. */}
          <span>NiN</span>
          <span className="text-accent">.X</span>
        </Link>

        {/* ---- Desktop nav ---- */}
        {/* Hidden on mobile (< md) to save horizontal space. */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // Active link gets a subtle background + accent text color.
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ---- Right-side actions: search + auth ---- */}
        <div className="flex items-center gap-2">
          {/* Search trigger — opens the command palette (rendered in SearchPalette).
              Shows a ⌘K hint on desktop to teach users the keyboard shortcut. */}
          <Button
            variant="ghost"
            // On desktop, show as a pill with the shortcut hint; on mobile, icon-only.
            className="hidden h-9 items-center gap-2 rounded-full border hairline bg-card px-3 text-sm text-muted-foreground shadow-premium-xs sm:inline-flex"
            aria-label="Search"
            // We dispatch a custom event that SearchPalette listens for. This
            // decouples the header from the palette implementation.
            onClick={() => window.dispatchEvent(new CustomEvent("ninx:open-search"))}
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            {/* ⌘K kbd badge — teaches the keyboard shortcut. */}
            <kbd className="hidden items-center gap-0.5 rounded border hairline bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
              ⌘K
            </kbd>
          </Button>
          {/* Mobile search — icon only (no room for the pill). */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => window.dispatchEvent(new CustomEvent("ninx:open-search"))}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Auth button — always visible. Routes to /auth (coming soon state). */}
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth">
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign in
            </Link>
          </Button>

          {/* ---- Mobile hamburger ---- */}
          {/* Sheet provides an accessible slide-in drawer. */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              {/* SheetTitle is required for screen reader accessibility. */}
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 px-4" aria-label="Mobile primary">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Auth link shown in the mobile drawer since the header button is hidden on mobile. */}
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
