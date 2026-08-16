// ============================================================================
// app/api/auth/status/route.ts — GET auth readiness status.
// ----------------------------------------------------------------------------
// Returns which auth methods are currently active. The frontend uses this to
// decide whether to show the login form or a "coming soon" notice.
// ==========================================================================
import { jsonResponse } from "@/lib/api-helpers";

// GET /api/auth/status
export async function GET() {
  // A provider is "ready" if its credentials are present in env vars.
  const google = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const apple = !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET);
  // Email/password is ready when the Credentials provider's authorize() is
  // implemented (currently returns null — disabled).
  const email = false;

  return jsonResponse({
    email,
    google,
    apple,
    ready: google || apple || email,
  });
}
