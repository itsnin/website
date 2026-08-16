import { jsonResponse } from "@/lib/api-helpers";

export async function GET() {
  const google = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const apple = !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET);
  const email = false;

  return jsonResponse({
    email,
    google,
    apple,
    ready: google || apple || email,
  });
}
