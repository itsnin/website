import { db } from "@/db";
import { shopProducts } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { jsonResponse } from "@/lib/api-helpers";

export async function GET() {
  const items = await db
    .select()
    .from(shopProducts)
    .where(inArray(shopProducts.status, ["COMING_SOON", "AVAILABLE"]))
    .orderBy(shopProducts.createdAt);

  return jsonResponse(items);
}
