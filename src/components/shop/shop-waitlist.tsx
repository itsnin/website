"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function ShopWaitlist() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length === 0) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);

    toast({
      title: "You're on the waitlist",
      description: "We'll email you the moment the shop opens.",
    });
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border hairline bg-background p-4 shadow-premium-xs">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm font-medium text-foreground">
          You&apos;re on the waitlist. We&apos;ll let you know when the shop opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:max-w-md">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address for shop waitlist"
        className="flex-1"
        disabled={submitting}
      />
      <Button type="submit" disabled={submitting || email.trim().length === 0}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Join waitlist
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
