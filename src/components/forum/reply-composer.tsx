// "coming soon" notice instead of a broken form
"use client";

import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, type AuthStatus } from "@/lib/api-client";

interface ReplyComposerProps {
  threadId: string;
  locked: boolean;
}

export function ReplyComposer({ threadId, locked }: ReplyComposerProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    apiFetch<AuthStatus>("/api/auth/status").then((res) => {
      if (res.ok) setAuthStatus(res.data);
    });
  }, []);

  if (locked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border hairline bg-secondary px-5 py-4 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        This thread is locked. New replies are not allowed.
      </div>
    );
  }

  if (authStatus && !authStatus.ready) {
    return (
      <div className="rounded-xl border border-dashed hairline bg-card px-5 py-6 text-center">
        <p className="text-sm font-medium text-foreground">Sign-in is coming soon</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Posting in the forum requires an account. Authentication will be
          available soon — check back later.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (body.trim().length === 0) return;
    setSubmitting(true);
    const res = await apiFetch(`/api/forum/threads/${threadId}/replies`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setSubmitting(false);

    if (res.ok) {
      setBody("");
      toast({ title: "Reply posted", description: "Your reply has been added." });
      window.location.reload();
    } else {
      toast({
        title: "Could not post reply",
        description: res.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-xl border hairline bg-card p-4">
      <label className="text-sm font-medium text-foreground" htmlFor="reply-body">
        Your reply
      </label>
      <Textarea
        id="reply-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a thoughtful reply…"
        className="mt-2 min-h-[100px]"
        disabled={submitting}
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || body.trim().length === 0}>
          {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Post reply
        </Button>
      </div>
    </div>
  );
}
