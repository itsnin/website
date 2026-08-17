import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "postgres",
    schema: {
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verification,
    },
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // cache session in cookie for 5 minutes
    },
  },
  socialProviders: {
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
    apple:
      process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
        ? {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }
        : undefined,
  },
  emailAndPassword: {
    enabled: false, // placeholder, enable when ready
  },
  baseURL: process.env.NEXTAUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : undefined,
});
