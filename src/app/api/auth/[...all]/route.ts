import { toNextJsHandler } from "better-auth/next";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
