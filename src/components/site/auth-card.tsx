// ============================================================================
// auth-card.tsx — client-side auth card with provider buttons.
// ----------------------------------------------------------------------------
// Checks /api/auth/status on mount. Shows disabled "coming soon" buttons when
// auth isn't wired yet. When the owner enables a provider, its button activates
// automatically — no UI changes needed.
// ==========================================================================
"use client";

import { useEffect, useState } from "react";
import { Mail, Apple, Chrome, Lock } from "lucide-react"; // Chrome icon stands in for Google
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, type AuthStatus } from "@/lib/api-client";

export function AuthCard() {
  const [status, setStatus] = useState<AuthStatus | null>(null);

  // Fetch auth readiness once on mount.
  useEffect(() => {
    apiFetch<AuthStatus>("/api/auth/status").then((res) => {
      if (res.ok) setStatus(res.data);
    });
  }, []);

  // While status is loading, render nothing to avoid a flash.
  if (!status) return null;

  // ready = false means no auth method is live yet.
  const comingSoon = !status.ready;

  return (
    <div className="rounded-2xl border hairline bg-card p-6">
      {/* ---- OAuth provider buttons ---- */}
      {/* Google button — uses Chrome icon as a stand-in (no brand icon in lucide). */}
      <Button
        variant="outline"
        className="w-full"
        disabled={!status.google}
        onClick={() => (window.location.href = "/api/auth/google")}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      {/* Apple button */}
      <Button
        variant="outline"
        className="mt-3 w-full"
        disabled={!status.apple}
        onClick={() => (window.location.href = "/api/auth/apple")}
      >
        <Apple className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>

      {/* Divider between OAuth and email */}
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {/* ---- Email/password form ---- */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" disabled={!status.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" disabled={!status.email} />
        </div>
        <Button className="w-full" disabled={!status.email}>
          <Mail className="mr-2 h-4 w-4" />
          Continue with email
        </Button>
      </div>

      {/* ---- Coming-soon banner ---- */}
      {comingSoon && (
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-secondary p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Authentication is coming soon
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The sign-in UI is fully built and ready. Google, Apple, and email
              login will activate as soon as credentials are configured. The
              forum will open for posting at the same time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
