// ============================================================================
// auth.ts — Auth.js (NextAuth) configuration.
// ----------------------------------------------------------------------------
// Uses the Drizzle adapter to store users/sessions/accounts in the SQLite
// database. For production (Cloudflare D1), swap the db client to the D1
// driver in db/index.ts — the adapter works with any Drizzle-compatible db.
//
// Providers:
//   - Google OAuth (needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET env vars)
//   - Apple OAuth (needs APPLE_* env vars)
//   - Email/password (Credentials provider — needs a real password hashing impl)
//
// Until credentials are configured, the auth status endpoint reports all
// providers as "not ready", and the frontend shows a "coming soon" state.
//
// Docs:
//   - NextAuth v4: https://next-auth.js.org/getting-started/introduction
//   - Drizzle adapter: https://authjs.dev/getting-started/adapters/drizzle
// ==========================================================================
import type { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import * as schema from "@/db/schema";

// authOptions — the central NextAuth configuration object.
// Docs: https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // The Drizzle adapter handles user/session/account persistence.
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  // session strategy — JWT (works without a database session lookup on every
  // request, which is ideal for serverless/edge runtimes like Cloudflare).
  session: { strategy: "jwt" },
  // pages — custom route for the sign-in page.
  pages: { signIn: "/auth" },
  providers: [
    // Google OAuth — only enabled if credentials are present.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Apple OAuth — only enabled if credentials are present.
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Credentials (email/password) — placeholder. Real implementation needs
    // password hashing (bcrypt/argon2) + user lookup. Disabled until wired.
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Return null until real auth is wired. The frontend shows "coming soon".
        return null;
      },
    }),
  ],
  // callbacks — attach the user id to the JWT + session.
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
