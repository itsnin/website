import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: PublicUser;
    }>();

    const userId = request.headers["x-ninx-user-id"];
    if (typeof userId !== "string" || userId.length === 0) {
      throw new UnauthorizedException("Authentication required");
    }

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
