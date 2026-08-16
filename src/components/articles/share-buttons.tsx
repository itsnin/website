"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // encodeuricomponent — required for safe url embedding in share intents
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The article link is in your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Clipboard access was blocked by your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Share
      </span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-full border hairline bg-card text-muted-foreground shadow-premium-xs transition-all hover:-translate-y-0.5 hover:text-accent hover:shadow-premium-sm"
      >
        <Linkedin className="h-4 w-4" />
      </a>

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
