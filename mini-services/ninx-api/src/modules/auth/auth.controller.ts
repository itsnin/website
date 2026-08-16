// ============================================================================
// auth.controller.ts — auth endpoints.
// ----------------------------------------------------------------------------
// GET  /auth/status  → readiness flags for each auth method
// POST /auth/register → placeholder (returns coming-soon)
// POST /auth/login    → placeholder (returns coming-soon)
// ==========================================================================
import { Controller, Get, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "@/common/dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // GET /auth/status — the frontend uses this to decide whether to show
  // the login form or a "coming soon" notice.
  @Get("status")
  status() {
    return this.auth.status();
  }

  // POST /auth/register — placeholder until real auth is wired.
  @Post("register")
  register(@Body() _dto: RegisterDto) {
    return { ok: false, message: "Auth is coming soon. Check back later." };
  }

  // POST /auth/login — placeholder until real auth is wired.
  @Post("login")
  login(@Body() _dto: LoginDto) {
    return { ok: false, message: "Auth is coming soon. Check back later." };
  }
}
