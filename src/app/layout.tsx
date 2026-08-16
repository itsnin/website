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
    default: "NiN — Development & Writing",
    template: "%s · NiN",
  },
  description:
    "NiN — personal hub for development projects, technical articles, and community discussion.",
  keywords: ["NiN", "development", "articles", "forum", "github", "engineering"],
  authors: [{ name: "NiN" }],
  metadataBase: new URL("https://nin.x"),
  openGraph: {
    title: "NiN — Development & Writing",
    description: "Personal hub for development projects, articles, and discussion.",
    url: "https://nin.x",
    siteName: "NiN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NiN",
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
