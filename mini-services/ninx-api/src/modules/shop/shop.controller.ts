// ============================================================================
// shop.controller.ts — read-only shop endpoints.
// ----------------------------------------------------------------------------
// Only GET routes exist for now. Admin write endpoints (POST/PATCH) will be
// added when the shop is fully implemented.
// ==========================================================================
import { Controller, Get, Param } from "@nestjs/common";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  // GET /shop — list visible products.
  @Get()
  list() {
    return this.shop.listVisible();
  }

  // GET /shop/:slug — single product.
  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.shop.getBySlug(slug);
  }
}
