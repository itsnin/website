import { Controller, Get, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "@/common/dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("status")
  status() {
    return this.auth.status();
  }

  @Post("register")
  register(@Body() _dto: RegisterDto) {
    return { ok: false, message: "Auth is coming soon. Check back later." };
  }

  @Post("login")
  login(@Body() _dto: LoginDto) {
    return { ok: false, message: "Auth is coming soon. Check back later." };
  }
}
