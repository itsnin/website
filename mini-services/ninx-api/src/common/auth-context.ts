// ============================================================================
// auth-context.ts — lightweight auth context extracted from the request.
// ----------------------------------------------------------------------------
// In a full implementation this would decode a JWT/session cookie. For now we
// parse an optional `x-ninx-user-id` header that the frontend sets after a
// (future) login flow. When absent, the request is treated as anonymous.
//
// This keeps the forum "read public, write auth-gated" rule enforceable today
// without coupling to a specific auth library.
//
// Docs:
//   - NestJS Custom Guards: https://docs.nestjs.com/guards
//   - NestJS Execution Context: https://docs.nestjs.com/fundamentals/execution-context
// ==========================================================================
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

// PublicUserShape — the safe, non-sensitive projection of a user.
export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}

// AuthGuard — blocks a route unless a valid user header is present.
// Apply with `@UseGuards(AuthGuard)` on any controller method that requires
// authentication (e.g., creating a forum thread).
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // ExecutionContext lets us access the underlying HTTP request regardless
    // of transport (REST/WS/gRPC). Docs: https://docs.nestjs.com/fundamentals/execution-context
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: PublicUser;
    }>();

    // Read the user id header. The frontend sets this after login.
    const userId = request.headers["x-ninx-user-id"];
    if (typeof userId !== "string" || userId.length === 0) {
      // 401 — no authenticated user. Frontend will show the "auth coming soon" state.
      throw new UnauthorizedException("Authentication required");
    }

    // Attach a minimal user object so handlers can read request.user safely.
    request.user = {
      id: userId,
      email: (request.headers["x-ninx-user-email"] as string) ?? "",
      name: null,
      role: "MEMBER",
      avatarUrl: null,
    };
    return true;
  }
}
