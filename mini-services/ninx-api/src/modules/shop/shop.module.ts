// ============================================================================
// shop.module.ts — wires the Shop feature.
// ==========================================================================
import { Module } from "@nestjs/common";
import { ShopController } from "./shop.controller";
import { ShopService } from "./shop.service";
import { PrismaService } from "@/common/prisma";

@Module({
  controllers: [ShopController],
  providers: [ShopService, PrismaService],
})
export class ShopModule {}
