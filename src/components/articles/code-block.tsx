// ============================================================================
// code-block.tsx — markdown code block with a copy-to-clipboard button.
// ----------------------------------------------------------------------------
// react-markdown lets us override the default `code` renderer. We use this
// component to wrap fenced code blocks in a container with a header (language
// label + copy button). Inline code is left to the .prose-ninx CSS.
//
// Docs:
//   - react-markdown custom components: https://github.com/remarkjs/react-markdown#components
//   - Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
// ==========================================================================
"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  // className — react-markdown passes "language-xxx" for fenced blocks.
  className?: string;
  // children — the raw code text.
  children?: ReactNode;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  // copied — flips to true briefly after a successful copy, for the check icon.
  const [copied, setCopied] = useState(false);

  // Extract the language from the className (e.g., "language-typescript" → "typescript").
  // If there's no className, treat it as inline code and let prose styling handle it.
  const match = /language-(\w+)/.exec(className ?? "");
  const language = match?.[1];
  const isBlock = !!language || String(children).includes("\n");

  // Inline code — return a plain <code> so prose-ninx styles it.
  if (!isBlock) {
    return <code className={className}>{children}</code>;
  }

  // Block code — wrap in a container with a header (lang + copy button).
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      // navigator.clipboard.writeText — modern async clipboard API.
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      // Reset the icon after 2 seconds.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail — clipboard may be blocked in some contexts.
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border hairline bg-foreground">
      {/* Header row — language label + copy button */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-white/50">
          {language ?? "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* The actual code — pre wraps for overflow scroll. */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
