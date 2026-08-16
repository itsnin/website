// ============================================================================
// RootLayout — the top-level server component wrapping every route.
// ----------------------------------------------------------------------------
// Purpose:
//   - Loads the Geist font families (sans + mono) via next/font so we get
//     Apple-like typography with zero layout shift.
//   - Mounts the AppShell (header + footer + search palette).
//   - Sets SEO metadata for the NiN.X brand.
//
// Key rules enforced here:
//   - <html> has NO `class="dark"` and NO ThemeProvider — this guarantees
//     the site is light-only, per the user's explicit requirement.
//
// Docs:
//   - next/font: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
//   - Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// ==========================================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/site/app-shell";

// Load Geist Sans as the primary UI font. `variable` exposes it as a CSS var
// so Tailwind's `font-sans` utility picks it up automatically.
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/fonts#using-a-css-variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Load Geist Mono for code blocks and technical content.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Brand-level metadata. This is the default for every route; individual pages
// can override via their own `export const metadata`.
// Docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
export const metadata: Metadata = {
  title: {
    default: "NiN.X — Development & Writing",
    template: "%s · NiN.X",
  },
  description:
    "NiN.X — personal hub for development projects, technical articles, and community discussion.",
  keywords: ["NiN.X", "development", "articles", "forum", "github", "engineering"],
  authors: [{ name: "NiN.X" }],
  metadataBase: new URL("https://nin.x"),
  openGraph: {
    title: "NiN.X — Development & Writing",
    description: "Personal hub for development projects, articles, and discussion.",
    url: "https://nin.x",
    siteName: "NiN.X",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NiN.X",
    description: "Development projects, articles, and discussion.",
  },
};

// RootLayout props — `children` is the routed page content.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: avoids warnings from browser extensions that
    // inject classes onto <html>. We do NOT add a `class="dark"`.
    <html lang="en" suppressHydrationWarning>
      <body
        // Compose font CSS variables + base typography utilities.
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppShell>{children}</AppShell>
        {/* Global toast portal — mounted once, controlled via useToast hook. */}
        <Toaster />
      </body>
    </html>
  );
}
