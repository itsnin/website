// show a friendly toast instead of a 404
import { Injectable } from "@nestjs/common";

export interface AuthStatus {
  email: boolean;   // email/password ready?
  google: boolean;  // Google OAuth ready?
  apple: boolean;   // Apple OAuth ready?
  ready: boolean;   // is ANY auth method live?
}

@Injectable()
export class AuthService {
  status(): AuthStatus {
    return {
      email: false,
      google: false,
      apple: false,
      ready: false,
    };
  }
}
