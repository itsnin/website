// ============================================================================
// shop.service.ts — placeholder service for the shop feature.
// ----------------------------------------------------------------------------
// Full commerce (cart, checkout, payments) is intentionally deferred. For now
// we expose a read-only list of products so the frontend can render the
// "coming soon" grid. The owner can seed COMING_SOON products later.
// ==========================================================================
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  // listVisible — returns products that are COMING_SOON or AVAILABLE.
  // DRAFT products stay hidden from the public storefront.
  async listVisible() {
    return this.prisma.shopProduct.findMany({
      where: { status: { in: ["COMING_SOON", "AVAILABLE"] } },
      orderBy: { createdAt: "asc" },
    });
  }

  // getBySlug — single product lookup by slug.
  async getBySlug(slug: string) {
    return this.prisma.shopProduct.findUnique({ where: { slug } });
  }
}
