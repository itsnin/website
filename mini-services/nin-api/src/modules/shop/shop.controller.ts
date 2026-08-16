import { Controller, Get, Param } from "@nestjs/common";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get()
  list() {
    return this.shop.listVisible();
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.shop.getBySlug(slug);
  }
}
