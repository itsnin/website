"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className ?? "");
  const language = match?.[1];
  const isBlock = !!language || String(children).includes("\n");

  // inline code — return a plain <code> so prose-ninx styles it
  if (!isBlock) {
    return <code className={className}>{children}</code>;
  }

  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail — clipboard may be blocked in some contexts
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border hairline bg-foreground">
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
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
