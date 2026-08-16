// <html> has no `class="dark"` and no themeprovider — this guarantees
// the site is light-only, per the user's explicit requirement
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/site/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppresshydrationwarning avoids warnings from browser extensions that inject classes onto <html>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
