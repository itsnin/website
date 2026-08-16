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

  useEffect(() => {
    apiFetch<AuthStatus>("/api/auth/status").then((res) => {
      if (res.ok) setStatus(res.data);
    });
  }, []);

  if (!status) return null;

  const comingSoon = !status.ready;

  return (
    <div className="rounded-2xl border hairline bg-card p-6">
      <Button
        variant="outline"
        className="w-full"
        disabled={!status.google}
        onClick={() => (window.location.href = "/api/auth/google")}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="mt-3 w-full"
        disabled={!status.apple}
        onClick={() => (window.location.href = "/api/auth/apple")}
      >
        <Apple className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

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
