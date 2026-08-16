// ============================================================================
// newsletter-signup.tsx — UI-ready newsletter signup section.
// ----------------------------------------------------------------------------
// The form is fully built but submission is deferred (no backend yet). On
// submit we show a friendly toast confirming the signup is "pending". When
// the owner wires a real provider (Mailchimp, Buttondown, etc.), only the
// submit handler needs to change.
//
// Docs: https://ui.shadcn.com/docs/components/input
// ==========================================================================
"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSignup() {
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
    // Replace with a real fetch to the newsletter provider when wired.
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);

    toast({
      title: "You're on the list",
      description: "Newsletter delivery will start once the service launches.",
    });
  };

  return (
    <section className="border-t hairline bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {/* Card container — accent-tinted background to distinguish from page bg */}
        <div className="relative overflow-hidden rounded-3xl border hairline bg-card p-8 shadow-premium-sm sm:p-12">
          {/* Decorative glow inside the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft blur-2xl"
          />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: copy */}
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                <Mail className="h-3.5 w-3.5" />
                Newsletter
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Get new articles in your inbox
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No spam, no noise. Just a heads-up when something new lands.
                Unsubscribe anytime.
              </p>
            </div>

            {/* Right: form OR success state */}
            <div className="w-full max-w-sm">
              {done ? (
                // Success state — shown after "submission".
                <div className="flex items-center gap-3 rounded-xl border hairline bg-background p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm font-medium text-foreground">
                    You&apos;re subscribed. Watch your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="flex-1"
                    disabled={submitting}
                  />
                  <Button type="submit" disabled={submitting || email.trim().length === 0}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Newsletter delivery starts when the service goes live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
