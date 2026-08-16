import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function jsonResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { message, error: message, statusCode: status },
    { status },
  );
}

export async function getServerSessionUser(): Promise<{ id: string; email: string; name: string | null } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: session.user.id ?? session.user.email,
    email: session.user.email,
    name: session.user.name ?? null,
  };
}

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
