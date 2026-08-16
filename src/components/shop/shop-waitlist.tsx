// ============================================================================
// shop-waitlist.tsx — email waitlist form for the shop page teaser.
// ----------------------------------------------------------------------------
// Client Component. The form is fully built but submission is deferred (no
// backend yet). On submit we simulate a network request and show a success
// state. When the owner wires a real provider, only the submit handler changes.
//
// Docs: https://ui.shadcn.com/docs/components/input
// ==========================================================================
"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function ShopWaitlist() {
  // email — controlled input value.
  const [email, setEmail] = useState("");
  // submitting — disables the form while the fake request is in flight.
  const [submitting, setSubmitting] = useState(false);
  // done — flips to a success state after "submission".
  const [done, setDone] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length === 0) return;

    setSubmitting(true);
    // Simulate a network round-trip so the loading state is visible.
    // Replace with a real fetch to the waitlist provider when wired.
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);

    toast({
      title: "You're on the waitlist",
      description: "We'll email you the moment the shop opens.",
    });
  };

  if (done) {
    // Success state — shown after "submission".
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
