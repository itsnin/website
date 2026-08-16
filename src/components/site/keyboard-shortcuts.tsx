"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], description: "Open search" },
  { keys: ["?"], description: "Show this help" },
  { keys: ["g", "h"], description: "Go home" },
  { keys: ["g", "f"], description: "Go to forum" },
  { keys: ["g", "s"], description: "Go to shop" },
  { keys: ["g", "a"], description: "Go to about" },
  { keys: ["g", "c"], description: "Go to contact" },
  { keys: ["g", "t"], description: "Go to tags" },
  { keys: ["Esc"], description: "Close dialogs" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  useEffect(() => {
    let prefixKey = false;
    let prefixTimeout: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // this prevents shortcuts from firing while writing forum posts, etc
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") return;

      if (e.key === "?" || e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      if (e.key === "g" && !prefixKey) {
        prefixKey = true;
        if (prefixTimeout) clearTimeout(prefixTimeout);
        prefixTimeout = setTimeout(() => {
          prefixKey = false;
        }, 1500);
        return;
      }

      if (prefixKey) {
        prefixKey = false;
        if (prefixTimeout) clearTimeout(prefixTimeout);
        switch (e.key) {
          case "h":
            e.preventDefault();
            navigate("/");
            break;
          case "f":
            e.preventDefault();
            navigate("/forum");
            break;
          case "s":
            e.preventDefault();
            navigate("/shop");
            break;
          case "a":
            e.preventDefault();
            navigate("/about");
            break;
          case "c":
            e.preventDefault();
            navigate("/contact");
            break;
          case "t":
            e.preventDefault();
            navigate("/tags");
            break;
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-accent" />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Press these keys anywhere on the site to navigate faster.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-4 space-y-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.description}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
            >
              <span className="text-sm text-foreground">{s.description}</span>
              <span className="flex shrink-0 gap-1">
                {s.keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="inline-flex min-w-[2rem] items-center justify-center rounded-md border hairline bg-card px-2 py-1 text-xs font-medium text-foreground shadow-premium-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: shortcuts are disabled while typing in input fields.
        </p>
      </DialogContent>
    </Dialog>
  );
}
