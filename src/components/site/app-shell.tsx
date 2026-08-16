// ============================================================================
// app-shell.tsx — the persistent layout wrapping every page.
// ----------------------------------------------------------------------------
// Responsibilities:
//   - Render the SiteHeader at the top.
//   - Provide a flex column that stretches to fill the viewport so the footer
//     sticks to the bottom on short pages (per the global UI spec).
//   - Render the SearchPalette globally so the search trigger works anywhere.
//   - Render the BackToTop floating button globally.
//   - Render the KeyboardShortcuts help dialog globally.
//   - Render the SiteFooter at the bottom.
//
// Docs:
//   - Next.js Layouts: https://nextjs.org/docs/app/api-reference/file-conventions/layout
// ==========================================================================
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SearchPalette } from "./search-palette";
import { BackToTop } from "./back-to-top";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    // min-h-screen + flex flex-col is the canonical pattern for a sticky footer.
    // The footer uses `mt-auto` to consume leftover vertical space.
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      {/* <main> is the scrollable content region. flex-1 lets it grow. */}
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Global overlays — mounted once, controlled via events / scroll / keys. */}
      <SearchPalette />
      <BackToTop />
      <KeyboardShortcuts />
    </div>
  );
}
