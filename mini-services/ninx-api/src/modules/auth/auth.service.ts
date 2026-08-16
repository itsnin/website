// ============================================================================
// auth.service.ts — authentication placeholder.
// ----------------------------------------------------------------------------
// The owner will wire real OAuth (Google + Apple) and email/password later.
// For now we expose:
//   - status()  → tells the frontend which auth methods are "ready"
//   - register/login → return a "coming soon" sentinel so the frontend can
//     show a friendly toast instead of a 404.
//
// When real auth lands, replace these bodies with JWT issuance + Prisma
// user creation. The DTOs + routes are already in place.
//
// Docs:
//   - NextAuth providers: https://next-auth.js.org/providers/
//   - OAuth with Google: https://developers.google.com/identity/protocols/oauth2
//   - Sign in with Apple: https://developer.apple.com/sign-in-with-apple/
// ==========================================================================
import { Injectable } from "@nestjs/common";

// AuthStatus — describes which auth methods are currently active.
export interface AuthStatus {
  email: boolean;   // email/password ready?
  google: boolean;  // Google OAuth ready?
  apple: boolean;   // Apple OAuth ready?
  ready: boolean;   // is ANY auth method live?
}

@Injectable()
export class AuthService {
  // status — returns the current auth readiness. All false for now because
  // the owner hasn't supplied OAuth credentials yet.
  status(): AuthStatus {
    return {
      email: false,
      google: false,
      apple: false,
      ready: false,
    };
  }
}
