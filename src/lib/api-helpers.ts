// ============================================================================
// api-helpers.ts — shared utilities for Route Handlers.
// ----------------------------------------------------------------------------
// Provides:
//   - jsonResponse: standard JSON response helper
//   - errorResponse: standard error response helper
//   - getServerSessionUser: gets the authenticated user from NextAuth session
//
// Docs:
//   - Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// ==========================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// jsonResponse — wraps data in a NextResponse with standard headers.
// Docs: https://nextjs.org/docs/app/api-reference/functions/next-response
export function jsonResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// errorResponse — standard error shape: { message, error, statusCode }.
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { message, error: message, statusCode: status },
    { status },
  );
}

// getServerSessionUser — returns the authenticated user's id + email from the
// NextAuth session, or null if not authenticated.
// Docs: https://next-auth.js.org/configuration/nextjs#getserversession
export async function getServerSessionUser(): Promise<{ id: string; email: string; name: string | null } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: session.user.id ?? session.user.email,
    email: session.user.email,
    name: session.user.name ?? null,
  };
}

// requireAuth — throws a 401 error response if the user is not authenticated.
// Returns the user if authenticated. Used by forum posting + article creation.
export async function requireAuth(): Promise<{ id: string; email: string; name: string | null }> {
  const user = await getServerSessionUser();
  if (!user) {
    throw new Response(JSON.stringify({ message: "Authentication required", statusCode: 401 }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
