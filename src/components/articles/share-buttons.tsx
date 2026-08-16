// ============================================================================
// share-buttons.tsx — social share row for the article detail page.
// ----------------------------------------------------------------------------
// Renders Twitter/X, LinkedIn, and a "copy link" button. All open share
// intents in a new tab. No tracking, no third-party scripts.
//
// Docs:
//   - Twitter/X share intent: https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
//   - LinkedIn share URL: https://www.linkedin.com/sharing/share-offsite/
// ==========================================================================
"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  // url — absolute URL of the article (for share intents).
  url: string;
  // title — article title, used as the share text.
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  // copied — flips to true briefly after copying the link.
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // encodeURIComponent — required for safe URL embedding in share intents.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Toast feedback — confirms the copy action to the user.
      toast({
        title: "Link copied",
        description: "The article link is in your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked (e.g., non-HTTPS context). Show an error toast.
      toast({
        title: "Couldn't copy",
        description: "Clipboard access was blocked by your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Share
      </span>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
      >
        <Twitter className="h-4 w-4" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
      >
        {copied ? <Check className="h-4 w-4 text-accent" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
