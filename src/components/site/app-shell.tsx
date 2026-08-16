// provide a flex column that stretches to fill the viewport so the footer
// sticks to the bottom on short pages (per the global ui spec)
// render the searchpalette globally so the search trigger works anywhere
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SearchPalette } from "./search-palette";
import { BackToTop } from "./back-to-top";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SearchPalette />
      <BackToTop />
      <KeyboardShortcuts />
    </div>
  );
}
