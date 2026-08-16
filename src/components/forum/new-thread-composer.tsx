// ============================================================================
// new-thread-composer.tsx — client-side form to create a forum thread.
// ----------------------------------------------------------------------------
// Mirrors the reply-composer pattern: check auth status first, show a
// coming-soon notice if auth isn't live, otherwise show the live form.
// ==========================================================================
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, type AuthStatus } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export function NewThreadComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Fetch auth readiness on mount.
  useEffect(() => {
    apiFetch<AuthStatus>("/api/auth/status").then((res) => {
      if (res.ok) setAuthStatus(res.data);
    });
  }, []);

  // Coming-soon state when auth isn't wired yet.
  if (authStatus && !authStatus.ready) {
    return (
      <div className="rounded-xl border border-dashed hairline bg-card px-5 py-8 text-center">
        <p className="text-sm font-medium text-foreground">Sign-in is coming soon</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Creating threads requires an account. Authentication will be available
          soon — check back later to start your first discussion.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (title.trim().length === 0) return;
    setSubmitting(true);
    const res = await apiFetch("/api/forum/threads", {
      method: "POST",
      body: JSON.stringify({ title, body, category }),
    });
    setSubmitting(false);

    if (res.ok) {
      toast({ title: "Thread created", description: "Your discussion is now live." });
      // Navigate to the new thread. res.data is the created thread with its id.
      const data = res.data as { id: string };
      router.push(`/forum/${data.id}`);
    } else {
      toast({
        title: "Could not create thread",
        description: res.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-5 rounded-xl border hairline bg-card p-5">
      {/* Title field */}
      <div className="space-y-2">
        <Label htmlFor="thread-title">Title</Label>
        <Input
          id="thread-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A clear, concise title"
          disabled={submitting}
        />
      </div>

      {/* Category field */}
      <div className="space-y-2">
        <Label htmlFor="thread-category">Category</Label>
        <Input
          id="thread-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. general, help, showcase"
          disabled={submitting}
        />
      </div>

      {/* Body field */}
      <div className="space-y-2">
        <Label htmlFor="thread-body">Body</Label>
        <Textarea
          id="thread-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe your topic in detail…"
          className="min-h-[160px]"
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || title.trim().length === 0}
        >
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Create thread
        </Button>
      </div>
    </div>
  );
}
