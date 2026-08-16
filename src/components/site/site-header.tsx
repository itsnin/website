"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

// we deliberately omit "pricing/dashboard" per the user's requirements
const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/", label: "Articles" },
  { href: "/forum", label: "Forum" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // the home "/" is special-cased to avoid matching every route
  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    // z-50 ensures it sits above page content. the border + shadow intensify
    <header
      className={`glass-panel sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? "border-b hairline shadow-premium-xs" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground"
          aria-label="NiN.X home"
        >
          <span>NiN</span>
          <span className="text-accent">.X</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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

        <div className="flex items-center gap-2">
          
          <Button
            variant="ghost"
            className="hidden h-9 items-center gap-2 rounded-full border hairline bg-card px-3 text-sm text-muted-foreground shadow-premium-xs sm:inline-flex"
            aria-label="Search"
            onClick={() => window.dispatchEvent(new CustomEvent("ninx:open-search"))}
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden items-center gap-0.5 rounded border hairline bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => window.dispatchEvent(new CustomEvent("ninx:open-search"))}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth">
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign in
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              {/* sheettitle is required for screen reader accessibility */}
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
