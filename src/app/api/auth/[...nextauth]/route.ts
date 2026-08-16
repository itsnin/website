// ============================================================================
// app/api/auth/[...nextauth]/route.ts — NextAuth catch-all handler.
// ----------------------------------------------------------------------------
// This is the standard NextAuth v4 App Router setup. It handles all
// /api/auth/* routes (signin, signout, callback, session, csrf, etc.).
//
// Docs: https://next-auth.js.org/configuration/nextjs#app-router
// ==========================================================================
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the NextAuth handler with our config.
const handler = NextAuth(authOptions);

// Export GET + POST — NextAuth uses both.
export { handler as GET, handler as POST };
